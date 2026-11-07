import type { IWebAccess, IWebDriver } from './types';
import type {
  DialogAnswer,
  IActionMotion,
  IDeviceImage,
  INetworkEntry,
  IRunVideo,
  IStepAction,
  IViewport,
} from '@/contract';
import type { IDeviceDriver, IShot, ShrinkImage } from '@/engine/devices/types';
import type {
  BrowserContext,
  CDPSession,
  Page,
  Request,
  Response,
} from 'playwright-core';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { describeMeasure, sampleFileOf } from '@/engine/devices/library';
import {
  CHROME_DISABLED_FEATURES,
  FIELD_FORMATS,
  MOTION_PROBE,
  WEB_DRIVER,
} from './constants';
import {
  describePage,
  findLocator,
  measureLocator,
  openApp,
  optionOf,
  originOf,
  pagesOf,
  summarizeMotion,
} from './library';

/**
 * Dirige um Chrome de verdade nesta máquina sem janela própria; o QA o vê no painel do
 * dispositivo.
 */
export class WebDriver implements IDeviceDriver {
  private readonly url: string;
  private readonly profileDir: string;
  private readonly pixelRatio: number;
  private readonly shrink: ShrinkImage | null;
  private readonly access: IWebAccess;
  private readonly onAddress: ((url: string) => void) | null;
  private readonly origins = new Set<string>();
  private readonly dialogs: string[] = [];
  private readonly requests = new Map<Request, INetworkEntry>();
  private readonly entries: INetworkEntry[] = [];
  private readonly answers = new Map<number, Response>();
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private screencast: CDPSession | null = null;
  private cdp: CDPSession | null = null;
  private onFrame: ((jpeg: Buffer) => void) | null = null;
  private lastMotion: IActionMotion | null = null;
  private resolved: {
    locator: string;
    toLocator: string | null;
    option: string | null;
  } | null = null;
  private viewport: IViewport;
  private isFocused = false;
  private dialogAnswer: DialogAnswer = 'ok';
  private promptText: string | null = null;

  public constructor(props: IWebDriver) {
    this.url = props.url;
    this.profileDir = props.profileDir;
    this.viewport = props.viewport ?? WEB_DRIVER.viewport;
    this.pixelRatio = Math.min(
      Math.max(props.pixelRatio ?? 1, 1),
      WEB_DRIVER.maxPixelRatio,
    );
    this.shrink = props.shrink ?? null;
    this.access = props.access ?? { headers: {}, credentials: null };
    this.onAddress = props.onAddress ?? null;
  }

  /**
   * Abre o Chrome num perfil vazio, para uma run nunca começar com o que uma anterior
   * guardou.
   */
  public async open(): Promise<void> {
    await rm(this.profileDir, { recursive: true, force: true, maxRetries: 5 });
    const origin = originOf(this.url);
    const { headers, credentials } = this.access;
    this.context = await chromium.launchPersistentContext(this.profileDir, {
      channel: 'chrome',
      headless: true,
      viewport: { ...this.viewport },
      deviceScaleFactor: this.pixelRatio,
      args: [
        `--force-device-scale-factor=${String(this.pixelRatio)}`,
        `--disable-features=${CHROME_DISABLED_FEATURES.join(',')}`,
      ],
      ...(credentials === null || origin === null
        ? {}
        : { httpCredentials: { ...credentials, origin } }),
    });
    if (origin !== null && Object.keys(headers).length > 0)
      await this.context.route(`${origin}/**`, (route) =>
        route.continue({ headers: { ...route.request().headers(), ...headers } }),
      );
    await this.context.addInitScript(MOTION_PROBE);
    this.context.on('request', (request) => {
      this.noteRequest(request);
    });
    this.context.on('requestfinished', (request) => {
      void this.settleRequest({ request, failure: null });
    });
    this.context.on('requestfailed', (request) => {
      void this.settleRequest({
        request,
        failure: request.failure()?.errorText ?? 'failed',
      });
    });
    this.context.on('page', (page) => {
      this.follow(page);
      void this.adopt(page);
    });
    this.page = this.context.pages()[0] ?? (await this.context.newPage());
    this.follow(this.page);

    await this.page.setViewportSize(this.viewport);
    await this.fit();
    await openApp({ page: this.page, url: this.url });
  }

  /**
   * Começa o app do zero para quem nunca o abriu: nenhum cookie, nada guardado, uma aba
   * nova no endereço dele.
   */
  public async restart(): Promise<void> {
    await this.openAnew({ isCleared: true });
  }

  /**
   * As requisições que o app fez desde que o Chrome abriu, na ordem em que começaram,
   * cada uma com como terminou quando terminou.
   */
  public network(): INetworkEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  /**
   * As chamadas de API que o app fez desde `since`, em ms de epoch, cada uma com como
   * terminou e o que respondeu quando falhou.
   */
  public apiCalls(since: number): INetworkEntry[] {
    return this.entries
      .filter(
        ({ type, startedAt }) =>
          startedAt >= since && WEB_DRIVER.apiRequests.some((one) => one === type),
      )
      .map((entry) => ({ ...entry }));
  }

  /**
   * O que uma chamada de API respondeu, cortado, enquanto o Chrome ainda o guarda; null
   * quando já sumiu.
   */
  public async responseBody(id: number): Promise<string | null> {
    const answer = this.answers.get(id);

    if (answer === undefined) return null;

    const text = await answer.text().catch(() => null);

    return text === null ? null : text.slice(0, WEB_DRIVER.bodyChars);
  }

  /**
   * O locator com que o último clique ou preenchimento achou o alvo, como o Playwright o
   * escreve, e a opção que um dropdown pegou.
   */
  public resolution(): {
    locator: string;
    toLocator: string | null;
    option: string | null;
  } | null {
    return this.resolved;
  }

  /**
   * Executa uma ação, respondendo os diálogos que ela abre do jeito que ela diz, e guarda
   * como a página se mexeu para o `motion`.
   */
  public async act(action: IStepAction): Promise<void> {
    const page = this.page;

    if (!page) throw new Error('The browser is not open.');

    this.resolved = null;

    if (action.kind === 'reopen') {
      await this.openAnew({ isCleared: false });
      await this.settle(this.page ?? page);

      return;
    }

    this.lastMotion = null;
    this.dialogAnswer = action.dialog ?? 'ok';
    this.promptText = action.promptText ?? null;

    try {
      const before = await this.markOf(page);

      await this.perform({ page, action });

      const acted = await this.markOf(page);

      if (action.kind === 'goto' || action.kind === 'press' || action.kind === 'click')
        await this.settle(page);

      if (action.kind !== 'wait' && acted !== null)
        await this.waitForQuiet({ page, from: acted });

      const after = await this.markOf(page);

      this.lastMotion = await this.motionSince({
        page,
        since: after?.origin === before?.origin ? (before?.at ?? 0) : 0,
      });
    } finally {
      this.dialogAnswer = 'ok';
      this.promptText = null;
    }
  }

  /** Como a página se mexeu durante a última ação, entregue uma vez. */
  public async motion(): Promise<IActionMotion | null> {
    const motion = this.lastMotion;

    this.lastMotion = null;

    return motion;
  }

  /**
   * A parte visível da página, reduzida, como o agente a lê: capturada inteira e
   * encolhida, já que o Chrome a desenhando pequena some com bordas de 1px.
   */
  public async glance(): Promise<IDeviceImage | null> {
    const cdp = await this.session();

    if (!cdp || !this.page) return null;

    const [x, y] = await this.page.evaluate<[number, number]>(
      '[window.scrollX, window.scrollY]',
    );
    const area = { x, y, ...this.viewport };

    if (this.shrink === null) {
      const small = await cdp.send('Page.captureScreenshot', {
        format: 'jpeg',
        quality: WEB_DRIVER.glanceQuality,
        clip: { ...area, scale: WEB_DRIVER.glanceScale / this.pixelRatio },
      });

      return { data: small.data, mimeType: 'image/jpeg' };
    }

    const whole = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: WEB_DRIVER.wholeQuality,
      clip: { ...area, scale: 1 },
    });
    const shrunk = this.shrink({
      image: Buffer.from(whole.data, 'base64'),
      width: Math.round(this.viewport.width * WEB_DRIVER.glanceScale),
      height: Math.round(this.viewport.height * WEB_DRIVER.glanceScale),
      quality: WEB_DRIVER.glanceQuality,
    });

    return { data: shrunk.toString('base64'), mimeType: 'image/jpeg' };
  }

  /**
   * O que a página mostra, e os diálogos que ela abriu desde a última olhada, com como
   * cada um foi respondido.
   */
  public async describe(): Promise<string> {
    if (!this.page) return '';

    const page = await describePage(this.page);
    const shown = this.dialogs.splice(0);

    return shown.length === 0 ? page : [page, 'DIALOGS:', ...shown].join('\n');
  }

  /**
   * Uma coisa da página medida para conferir com um design: a caixa em px CSS onde a
   * página está, o espaço em volta, e a tipografia, as cores e o espaçamento calculados.
   */
  public async inspect(target: string): Promise<string> {
    if (!this.page) throw new Error('The browser is not open.');

    const locator = await findLocator({ page: this.page, target, kind: 'click' });

    if (locator === null) throw new Error(`Nothing on the page reads "${target}".`);

    return describeMeasure(await measureLocator(locator));
  }

  /**
   * As páginas a que o cabeçalho e os menus da página aberta levam, no próprio site, na
   * ordem em que aparecem.
   */
  public async navigation(): Promise<string[]> {
    if (!this.page) return [];

    const hrefs = await this.page
      .$$eval('header a[href], nav a[href]', (links) =>
        links.map((link) => (link as unknown as { href: string }).href),
      )
      .catch(() => []);

    return pagesOf({ hrefs, current: this.page.url() });
  }

  public async shoot(file: string): Promise<IShot | null> {
    if (!this.page) return null;

    const image = await this.page.screenshot({ path: file, type: 'jpeg', quality: 70 });

    return { file, dataUrl: `data:image/jpeg;base64,${image.toString('base64')}` };
  }

  public async stream(onFrame: (jpeg: Buffer) => void): Promise<boolean> {
    if (!this.context || !this.page) return false;

    await this.watch(onFrame);

    return true;
  }

  /**
   * Um navegador é gravado a partir da transmissão ao vivo pela janela de gravação, então
   * o driver não grava nada sozinho.
   */
  public async record(): Promise<boolean> {
    return Promise.resolve(false);
  }

  public async stopRecording(): Promise<IRunVideo | null> {
    return Promise.resolve(null);
  }

  /**
   * Transmite no detalhe máximo da tela enquanto o QA vê o dispositivo de perto, e em 1x
   * no resto do tempo.
   */
  public async focus(isFocused: boolean): Promise<void> {
    this.isFocused = isFocused;
    await this.recast();
  }

  /**
   * Dá à página um novo tamanho de janela no meio da run, e à transmissão os frames que
   * combinam.
   */
  public async resize(viewport: IViewport): Promise<void> {
    this.viewport = viewport;

    if (!this.page) return;

    await this.page.setViewportSize(viewport);
    await this.fit();
    await this.recast();
  }

  public async close(): Promise<void> {
    await this.screencast?.detach().catch(() => undefined);
    await this.cdp?.detach().catch(() => undefined);
    this.screencast = null;
    this.cdp = null;
    this.onFrame = null;
    await this.context?.close().catch(() => undefined);
    this.context = null;
    this.page = null;
  }

  /**
   * Transmite os frames da aba aberta para quem estiver vendo; uma aba nova pede uma nova
   * visualização.
   */
  private async watch(onFrame: (jpeg: Buffer) => void): Promise<void> {
    if (!this.context || !this.page) return;

    const session = await this.context.newCDPSession(this.page);

    session.on('Page.screencastFrame', (frame) => {
      onFrame(Buffer.from(frame.data, 'base64'));
      void session
        .send('Page.screencastFrameAck', { sessionId: frame.sessionId })
        .catch(() => undefined);
    });

    this.screencast = session;
    this.onFrame = onFrame;
    await this.cast();
  }

  /**
   * Vira para uma aba que o app abriu, como os olhos de uma pessoa, e volta para a que a
   * abriu quando ela fecha.
   */
  private async adopt(page: Page): Promise<void> {
    const opener = await page.opener().catch(() => null);

    if (opener === null) return;

    page.once('close', () => {
      if (this.page === page && !opener.isClosed()) void this.show(opener);
    });
    await this.show(page);
  }

  private async show(page: Page): Promise<void> {
    await this.screencast?.detach().catch(() => undefined);
    await this.cdp?.detach().catch(() => undefined);
    this.screencast = null;
    this.cdp = null;
    this.page = page;
    this.tellAddress(page);
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await page.setViewportSize(this.viewport).catch(() => undefined);
    await this.fit();

    if (this.onFrame) await this.watch(this.onFrame);
  }

  /**
   * Anota uma requisição que o app começou, até um limite; só as da web, nunca um
   * endereço data: ou chrome:.
   */
  private noteRequest(request: Request): void {
    const url = request.url();

    if (!/^https?:/i.test(url) || this.entries.length >= WEB_DRIVER.networkLimit) return;

    const entry: INetworkEntry = {
      id: this.entries.length + 1,
      method: request.method(),
      url,
      type: request.resourceType(),
      status: null,
      failure: null,
      startedAt: Date.now(),
      durationMs: null,
      size: null,
    };

    this.entries.push(entry);
    this.requests.set(request, entry);
  }

  /**
   * Anota como uma requisição terminou: o status, quanto demorou, quanto pesou uma página
   * ou chamada de API, e o que uma chamada de API que falhou respondeu.
   */
  private async settleRequest(props: {
    request: Request;
    failure: string | null;
  }): Promise<void> {
    const entry = this.requests.get(props.request);

    if (entry === undefined) return;

    this.requests.delete(props.request);

    const endedAt = Date.now();
    const response = await props.request.response().catch(() => null);
    const isSized =
      props.failure === null &&
      WEB_DRIVER.sizedRequests.some((type) => type === entry.type);
    const sizes = isSized ? await props.request.sizes().catch(() => null) : null;
    const timing = props.request.timing();

    entry.durationMs =
      timing.responseEnd > 0
        ? Math.round(timing.responseEnd)
        : Math.max(0, endedAt - entry.startedAt);
    entry.failure = props.failure;
    entry.status = response?.status() ?? null;
    entry.size = sizes?.responseBodySize ?? null;

    if (response === null || !WEB_DRIVER.apiRequests.some((type) => type === entry.type))
      return;

    this.answers.set(entry.id, response);

    for (const id of [...this.answers.keys()].slice(
      0,
      Math.max(0, this.answers.size - WEB_DRIVER.answersKept),
    ))
      this.answers.delete(id);

    if (entry.status !== null && entry.status >= 400) {
      const text = await response.text().catch(() => null);

      if (text !== null && text.length > 0)
        entry.body = text.slice(0, WEB_DRIVER.bodyChars);
    }
  }

  /**
   * Guarda cada site que uma aba abriu, para um começo do zero limpar o que cada um
   * guardou, e responde os diálogos, OK a menos que a ação mande cancelar.
   */
  private follow(page: Page): void {
    page.on('framenavigated', (frame) => {
      const origin = originOf(frame.url());

      if (origin !== null) this.origins.add(origin);

      if (frame === page.mainFrame() && page === this.page) this.tellAddress(page);
    });
    page.on('dialog', (dialog) => {
      const isOk = this.dialogAnswer === 'ok';
      const typed = dialog.type() === 'prompt' ? this.promptText : null;
      const answer = typed === null ? '' : ` with "${typed}"`;

      this.dialogs.push(
        `${dialog.type()}: ${dialog.message()} (answered ${isOk ? `OK${answer}` : 'Cancel'})`,
      );
      void (
        isOk ? dialog.accept(typed ?? dialog.defaultValue()) : dialog.dismiss()
      ).catch(() => undefined);
    });
  }

  private tellAddress(page: Page): void {
    const url = page.url();

    if (originOf(url) !== null) this.onAddress?.(url);
  }

  private async openAnew(props: { isCleared: boolean }): Promise<void> {
    const context = this.context;

    if (!context) throw new Error('The browser is not open.');

    await this.screencast?.detach().catch(() => undefined);
    await this.cdp?.detach().catch(() => undefined);
    this.screencast = null;
    this.cdp = null;
    this.lastMotion = null;

    const page = await context.newPage();

    for (const stale of context.pages())
      if (stale !== page) await stale.close().catch(() => undefined);

    this.page = page;
    await page.setViewportSize(this.viewport);

    if (props.isCleared) {
      await context.clearCookies();
      await context.clearPermissions();

      const cdp = await this.session();

      for (const origin of this.origins)
        await cdp
          ?.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' })
          .catch(() => undefined);
    }

    await this.fit();

    if (this.onFrame) await this.watch(this.onFrame);

    await openApp({ page, url: this.url });
  }

  private async perform(props: { page: Page; action: IStepAction }): Promise<void> {
    const { page, action } = props;

    if (action.kind === 'goto') {
      await page.goto(action.target, { timeout: WEB_DRIVER.gotoTimeoutMs });

      return;
    }

    if (action.kind === 'press') {
      await page.keyboard.press(action.target.length > 0 ? action.target : 'Enter');

      return;
    }

    if (action.kind === 'wait') {
      await page.waitForTimeout(Number(action.value) || WEB_DRIVER.waitMs);

      return;
    }

    if (action.kind === 'scroll') {
      await this.scrollPage({ page, direction: action.value, until: action.target });

      return;
    }

    const locator = await findLocator({
      page,
      target: action.target,
      kind: action.kind === 'fill' || action.kind === 'upload' ? 'fill' : 'click',
    });

    if (!locator) throw new Error(`Nothing on the page answers to "${action.target}".`);

    const timeout = WEB_DRIVER.actionTimeoutMs;

    this.resolved = { locator: String(locator), toLocator: null, option: null };

    if (action.kind === 'long_press') {
      await locator.click({ delay: WEB_DRIVER.longPressMs, timeout });

      return;
    }

    if (action.kind === 'hover') {
      await locator.hover({ timeout });

      return;
    }

    if (action.kind === 'drag') {
      const drop = await findLocator({ page, target: action.value, kind: 'click' });

      if (!drop) throw new Error(`Nothing on the page answers to "${action.value}".`);

      this.resolved = { locator: String(locator), toLocator: String(drop), option: null };
      await locator.dragTo(drop, { timeout });

      return;
    }

    if (action.kind === 'upload') {
      const sample = sampleFileOf(action.value);
      const file = join(tmpdir(), WEB_DRIVER.samplesFolder, sample.name);

      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, sample.bytes);

      const isField = await locator
        .evaluate((element) => {
          const field = element as unknown as { tagName: string; type?: string };

          return field.tagName === 'INPUT' && field.type === 'file';
        })
        .catch(() => false);

      if (isField) {
        await locator.setInputFiles(file, { timeout });

        return;
      }

      const [chooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout }),
        locator.click({ timeout }),
      ]);

      await chooser.setFiles(file);

      return;
    }

    if (action.kind !== 'fill') {
      await locator.click({ timeout: WEB_DRIVER.actionTimeoutMs });

      return;
    }

    const options = await locator
      .evaluate((element) => {
        const select = element as unknown as {
          tagName: string;
          options?: { [index: number]: { label: string; value: string }; length: number };
        };

        if (select.tagName !== 'SELECT' || !select.options) return null;

        return Array.from({ length: select.options.length }, (_, index) => ({
          label: select.options?.[index]?.label ?? '',
          value: select.options?.[index]?.value ?? '',
        }));
      })
      .catch(() => null);
    if (options === null) {
      await locator.fill(action.value, { timeout }).catch(async (reason: unknown) => {
        const type = await locator.getAttribute('type').catch(() => null);
        const format = FIELD_FORMATS[type ?? ''];

        throw format === undefined
          ? reason
          : new Error(`"${action.target}" takes ${format}.`);
      });

      return;
    }

    const option = optionOf({ options, wanted: action.value });

    if (option === null)
      throw new Error(
        `"${action.target}" has no option "${action.value}". It offers: ${options.map(({ label }) => label).join(', ')}.`,
      );

    this.resolved = { locator: String(locator), toLocator: null, option: option.value };
    await locator.selectOption(option.value, { timeout });
  }

  private async scrollPage(props: {
    page: Page;
    direction: string;
    until: string;
  }): Promise<void> {
    const { page, direction } = props;
    const until = props.until.trim();
    const { width, height } = this.viewport;
    const reach = WEB_DRIVER.scrollShare;
    const [dx, dy] =
      direction === 'up'
        ? [0, -height * reach]
        : direction === 'right'
          ? [width * reach, 0]
          : direction === 'left'
            ? [-width * reach, 0]
            : [0, height * reach];

    await page.mouse.move(width / 2, height / 2);

    if (until === '') {
      await page.mouse.wheel(dx, dy);
      await page.waitForTimeout(WEB_DRIVER.scrollSettleMs);

      return;
    }

    for (let tries = 0; tries < WEB_DRIVER.scrollTries; tries += 1) {
      const shown = page.getByText(until).first();

      if (await shown.isVisible().catch(() => false)) {
        await shown
          .scrollIntoViewIfNeeded({ timeout: WEB_DRIVER.actionTimeoutMs })
          .catch(() => undefined);

        return;
      }

      await page.mouse.wheel(dx, dy);
      await this.settle(page);
    }

    throw new Error(`Nothing on the page reads "${until}" after scrolling ${direction}.`);
  }

  private async markOf(page: Page): Promise<{ origin: number; at: number } | null> {
    return page
      .evaluate<{ origin: number; at: number }>(
        '({ origin: performance.timeOrigin, at: performance.now() })',
      )
      .catch(() => null);
  }

  private async waitForQuiet(props: {
    page: Page;
    from: { origin: number; at: number };
  }): Promise<void> {
    const { page, from } = props;
    const until = Date.now() + WEB_DRIVER.quietCapMs;
    const idle = `performance.now() - Math.max(window.__qazinho?.lastChange ?? 0, performance.timeOrigin === ${String(from.origin)} ? ${String(from.at)} : 0)`;

    while (Date.now() < until) {
      const idleMs = await page.evaluate<number>(idle).catch(() => Infinity);

      if (idleMs >= WEB_DRIVER.quietMs) return;

      await page.waitForTimeout(WEB_DRIVER.quietPollMs);
    }
  }

  private async motionSince(props: {
    page: Page;
    since: number;
  }): Promise<IActionMotion | null> {
    const probed = await props.page
      .evaluate<{
        shifts: { at: number; value: number; hadInput: boolean }[];
        frames: { at: number; ms: number }[];
      } | null>(
        'window.__qazinho ? { shifts: window.__qazinho.shifts, frames: window.__qazinho.frames } : null',
      )
      .catch(() => null);

    if (!probed) return null;

    return summarizeMotion({
      shifts: probed.shifts.filter(({ at }) => at >= props.since),
      frames: probed.frames.filter(({ at }) => at >= props.since),
    });
  }

  private async session(): Promise<CDPSession | null> {
    if (!this.context || !this.page) return null;

    this.cdp ??= await this.context.newCDPSession(this.page);

    return this.cdp;
  }

  /**
   * Ajusta a janela em volta do viewport, para a transmissão enquadrar a página inteira e
   * nada abaixo dela.
   */
  private async fit(): Promise<void> {
    const cdp = await this.session();

    if (!cdp) return;

    await cdp
      .send('Browser.getWindowForTarget')
      .then(({ windowId }) =>
        cdp.send('Browser.setContentsSize', { windowId, ...this.viewport }),
      )
      .catch(() => undefined);
  }

  private async recast(): Promise<void> {
    if (!this.screencast) return;

    await this.screencast.send('Page.stopScreencast').catch(() => undefined);
    await this.cast().catch(() => undefined);
    await this.still();
  }

  /**
   * Limita um frame só pela altura: o Chrome mantém a janela com 500 pixels de largura,
   * então uma página mais estreita vem enquadrada mais larga.
   */
  private async cast(): Promise<void> {
    const detail = this.isFocused ? this.pixelRatio : 1;

    await this.screencast?.send('Page.startScreencast', {
      format: 'jpeg',
      quality: WEB_DRIVER.streamQuality,
      maxHeight: Math.round(this.viewport.height * detail),
    });
  }

  /**
   * Entrega à transmissão a página como está: uma página parada não manda frame quando a
   * transmissão recomeça.
   */
  private async still(): Promise<void> {
    const shot = await this.screencast
      ?.send('Page.captureScreenshot', {
        format: 'jpeg',
        quality: WEB_DRIVER.streamQuality,
      })
      .catch(() => null);

    if (shot) this.onFrame?.(Buffer.from(shot.data, 'base64'));
  }

  /**
   * Espera terminar o que uma ação começou, para a página que o agente lê em seguida ser
   * a nova.
   */
  private async settle(page: Page): Promise<void> {
    await page
      .waitForLoadState('networkidle', { timeout: WEB_DRIVER.settleMs })
      .catch(() => undefined);
  }
}
