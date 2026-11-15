import type { IIosDriver } from './types';
import type {
  DeviceInput,
  IDeviceImage,
  IRunVideo,
  IScreenBox,
  IStepAction,
  IViewport,
} from '@/contract';
import type {
  IDeviceDriver,
  IDeviceFrame,
  IShot,
  IWindowPlace,
  ShrinkImage,
} from '@/engine/devices/types';
import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { access, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RUN_VIDEO_FILES } from '@/engine/devices/constants';
import {
  describeMeasure,
  mp4FactsOf,
  phoneFrameOf,
  phoneGlance,
  fractionBoxOf,
  phoneMeasureOf,
  phoneShot,
  swipeOf,
} from '@/engine/devices/library';
import { IOS } from './constants';
import {
  bundleOfPlist,
  describeIosScreen,
  findElement,
  idbInputOf,
  parseBooted,
  parseElements,
  runTool,
  screenOf,
  simulatorAppsOf,
} from './library';

/** Dirige um simulador iOS. O simctl liga e instala; só o idb toca a tela. */
export class IosDriver implements IDeviceDriver {
  private readonly idb: string;
  private readonly udid: string;
  private readonly app: string;
  private readonly shrink: ShrinkImage | null;
  private bundle = '';
  private isOurs = false;
  private recording: { process: ChildProcess; file: string; startedAt: number } | null =
    null;
  private size: { width: number; height: number } | null = null;
  private readonly place: IWindowPlace | null;
  private readonly onClosed: (() => void) | null;
  private isSimulatorOurs = false;
  private simulatorApp: string | null = null;
  private watching: ReturnType<typeof setInterval> | null = null;

  public constructor(props: IIosDriver) {
    this.idb = props.idb;
    this.udid = props.udid;
    this.app = props.app;
    this.shrink = props.shrink ?? null;
    this.place = props.window ?? null;
    this.onClosed = props.onClosed ?? null;
  }

  public async open(): Promise<void> {
    if (!(await this.isBooted())) {
      await this.simctl(['boot', this.udid]);
      this.isOurs = true;
    }

    await this.simctl(['bootstatus', this.udid, '-b']);

    this.bundle = await this.identify();

    await this.installFresh();
    await this.expectOpen();
    await this.showWindow();
  }

  /**
   * Começa o app do zero numa instalação nova: um simulador guarda os dados de um app até
   * o app ser removido.
   */
  public async restart(): Promise<void> {
    await this.installFresh();
    await this.expectOpen();
  }

  public async act(action: IStepAction): Promise<void> {
    if (action.kind === 'wait') {
      await new Promise((wake) => setTimeout(wake, Number(action.value) || IOS.waitMs));

      return;
    }

    if (action.kind === 'press') {
      await this.ui([
        'key',
        IOS.keys[action.target.toLowerCase()] ?? IOS.keys.enter ?? '40',
      ]);
      await this.settle();

      return;
    }

    if (action.kind === 'goto') {
      await this.simctl(['launch', this.udid, this.bundle]);
      await this.settle();

      return;
    }

    if (action.kind === 'reopen') {
      await this.simctl(['terminate', this.udid, this.bundle]).catch(() => '');
      await this.simctl(['launch', this.udid, this.bundle]);
      await this.settle();
      await this.expectOpen();

      return;
    }

    if (action.kind === 'scroll') {
      await this.scroll({ direction: action.value, until: action.target });

      return;
    }

    if (
      action.kind === 'hover' ||
      action.kind === 'upload' ||
      action.kind === 'open_download' ||
      action.kind === 'tab'
    )
      throw new Error(IOS.notOnPhone[action.kind]);

    const elements = await this.read();
    const element = findElement({ elements, target: action.target });

    if (!element) throw new Error(`Nothing on the screen answers to "${action.target}".`);

    if (action.kind === 'long_press') {
      await this.ui([
        'tap',
        String(element.x),
        String(element.y),
        '--duration',
        String(IOS.longPressSec),
      ]);
      await this.settle();

      return;
    }

    if (action.kind === 'drag') {
      const drop = findElement({ elements, target: action.value });

      if (!drop) throw new Error(`Nothing on the screen answers to "${action.value}".`);

      await this.ui([
        'swipe',
        ...[element.x, element.y, drop.x, drop.y].map(String),
        '--duration',
        String(IOS.dragSec),
      ]);
      await this.settle();

      return;
    }

    await this.ui(['tap', String(element.x), String(element.y)]);

    if (action.kind === 'fill') {
      await this.settle();
      await this.ui(['text', action.value]);
    }

    await this.settle();
  }

  public async describe(): Promise<string> {
    return describeIosScreen({ elements: await this.read(), app: this.bundle });
  }

  /** Um gesto do QA no simulador, nos pontos em que o idb toca. */
  public async touch(input: DeviceInput): Promise<void> {
    this.size ??= screenOf(await this.ui(['describe-all']).catch(() => ''));

    if (this.size === null)
      throw new Error('The simulator did not say how big its screen is.');

    for (const args of idbInputOf({ input, size: this.size })) await this.ui(args);
  }

  /** A tela do simulador agora, como um quadro, para o QA vê-la enquanto a dirige. */
  public async snapshot(): Promise<IDeviceFrame | null> {
    const file = join(tmpdir(), `qazinho-frame-${randomUUID()}.png`);

    try {
      await this.simctl(['io', this.udid, 'screenshot', file]);

      return phoneFrameOf({ image: await readFile(file), shrink: this.shrink });
    } finally {
      await rm(file, { force: true });
    }
  }

  /**
   * Uma coisa da tela medida para conferir com um design: a caixa em pontos, a caixa em
   * volta e o espaço até os vizinhos.
   */
  public async inspect(target: string): Promise<string> {
    const elements = await this.read();
    const element = findElement({ elements, target });

    if (!element) throw new Error(`Nothing on the screen reads "${target}".`);

    return describeMeasure(
      phoneMeasureOf({
        role: element.role,
        text: element.label,
        box: element.box,
        others: elements.filter((one) => one !== element).map(({ box }) => box),
        unit: 'pt',
        scale: 1,
      }),
    );
  }

  /** Onde uma coisa da tela está agora, em frações dela; nada quando não está lá. */
  public async locate(target: string): Promise<IScreenBox | null> {
    const described = await this.ui(['describe-all']);
    const element = findElement({ elements: parseElements(described), target });
    const screen = screenOf(described);

    return element === null || screen === null
      ? null
      : fractionBoxOf({ box: element.box, screen });
  }

  /**
   * A tela do simulador como o agente a lê, por um arquivo que o simctl escreve e o
   * QAzinho remove.
   */
  public async glance(): Promise<IDeviceImage | null> {
    const file = join(tmpdir(), `qazinho-glance-${randomUUID()}.png`);

    try {
      await this.simctl(['io', this.udid, 'screenshot', file]);

      return phoneGlance({ image: await readFile(file), shrink: this.shrink });
    } finally {
      await rm(file, { force: true });
    }
  }

  /**
   * Um simulador mantém o tamanho do aparelho que ele é, então um novo tamanho de janela
   * não muda nada.
   */
  public async resize(_viewport: IViewport): Promise<void> {
    return Promise.resolve();
  }

  /** Um simulador não é transmitido, então vê-lo de perto não muda nada. */
  public async focus(): Promise<void> {
    return Promise.resolve();
  }

  /** A tela do simulador guardada na run, como JPEG no tamanho cheio. */
  public async shoot(file: string): Promise<IShot | null> {
    await this.simctl(['io', this.udid, 'screenshot', file]);

    const shot = phoneShot({ image: await readFile(file), shrink: this.shrink });

    await writeFile(file, shot.bytes);

    return {
      file,
      dataUrl: `data:${shot.mimeType};base64,${shot.bytes.toString('base64')}`,
    };
  }

  /**
   * O QAzinho só desliga o que o QAzinho iniciou: um simulador que o QA abriu continua
   * aberto.
   */
  public async stream(): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Grava a tela do simulador na pasta da run até mandarem parar, a partir do momento em
   * que o simctl diz que começou.
   */
  public async record(folder: string): Promise<boolean> {
    const file = join(folder, RUN_VIDEO_FILES.mp4);
    const child = spawn(
      'xcrun',
      ['simctl', 'io', this.udid, 'recordVideo', '--codec=h264', '--force', file],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    const isStarted = await new Promise<boolean>((settle) => {
      const timer = setTimeout(() => {
        settle(false);
      }, IOS.recordStartMs);
      const end = (started: boolean) => {
        clearTimeout(timer);
        settle(started);
      };

      child.stderr.on('data', (chunk: Buffer) => {
        if (chunk.toString().includes(IOS.recordStarted)) end(true);
      });
      child.once('exit', () => {
        end(false);
      });
      child.once('error', () => {
        end(false);
      });
    });

    if (!isStarted) {
      child.kill('SIGKILL');

      return false;
    }

    this.recording = { process: child, file, startedAt: Date.now() };

    return true;
  }

  /**
   * Termina a gravação do jeito que o simctl escreve o arquivo inteiro, e lê quanto tempo
   * e quanto peso ela deu.
   */
  public async stopRecording(): Promise<IRunVideo | null> {
    const recording = this.recording;

    this.recording = null;

    if (recording === null) return null;

    const exited = new Promise<void>((done) => {
      recording.process.once('exit', () => {
        done();
      });
    });

    recording.process.kill('SIGINT');
    await Promise.race([
      exited,
      new Promise((wake) => setTimeout(wake, IOS.recordStopMs)),
    ]);

    const facts = mp4FactsOf(await readFile(recording.file).catch(() => null));

    return facts === null ? null : { startedAt: recording.startedAt, ...facts };
  }

  public async close(): Promise<void> {
    if (this.watching !== null) clearInterval(this.watching);

    this.watching = null;

    if (this.isSimulatorOurs && this.simulatorApp !== null)
      await runTool({
        command: 'osascript',
        args: ['-e', `quit app "${this.simulatorApp}"`],
      }).catch(() => '');

    this.isSimulatorOurs = false;

    if (this.isOurs) await this.simctl(['shutdown', this.udid]).catch(() => '');

    this.isOurs = false;
  }

  private async scroll(props: { direction: string; until: string }): Promise<void> {
    const size = screenOf(await this.ui(['describe-all']).catch(() => ''));

    if (size === null)
      throw new Error('The simulator did not say how big its screen is.');

    const { from, to } = swipeOf({ size, direction: props.direction });
    const until = props.until.trim();
    const swipe = async () => {
      await this.ui([
        'swipe',
        ...[from.x, from.y, to.x, to.y].map(String),
        '--duration',
        String(IOS.swipeSec),
      ]);
      await this.settle();
    };

    if (until === '') {
      await swipe();

      return;
    }

    const isShown = async () => {
      const found = findElement({ elements: await this.read(), target: until });

      return (
        found !== null &&
        found !== undefined &&
        found.x >= 0 &&
        found.y >= 0 &&
        found.x <= size.width &&
        found.y <= size.height
      );
    };

    for (let tries = 0; tries < IOS.scrollTries; tries += 1) {
      if (await isShown()) return;

      await swipe();
    }

    if (await isShown()) return;

    throw new Error(
      `Nothing on the screen reads "${until}" after scrolling ${props.direction}.`,
    );
  }

  private async expectOpen(): Promise<void> {
    let isHome = false;

    for (let tries = 0; tries < IOS.openChecks; tries += 1) {
      const elements = await this.read();

      isHome = elements.some(({ isLaunchIcon }) => isLaunchIcon);

      if (!isHome && elements.some(({ label }) => label.trim().length > 0)) return;

      await new Promise((wake) => setTimeout(wake, IOS.settleMs));
    }

    if (isHome)
      throw new Error(
        'The app closed right after it opened: the simulator shows its home screen.',
      );
  }

  private async installFresh(): Promise<void> {
    await this.simctl(['terminate', this.udid, this.bundle]).catch(() => '');
    await this.simctl(['uninstall', this.udid, this.bundle]).catch(() => '');
    await this.simctl(['install', this.udid, this.app]);
    await this.simctl(['launch', this.udid, this.bundle]);
    await this.settle();
  }

  private async identify(): Promise<string> {
    const printed = await runTool({
      command: 'plutil',
      args: ['-extract', 'CFBundleIdentifier', 'raw', join(this.app, 'Info.plist')],
    });

    const bundle = bundleOfPlist(printed);

    if (bundle === null)
      throw new Error(`${this.app} does not name a bundle identifier.`);

    return bundle;
  }

  private async read() {
    return parseElements(await this.ui(['describe-all']));
  }

  private async isBooted(): Promise<boolean> {
    const listed = await this.simctl(['list', 'devices']).catch(() => '');

    return parseBooted(listed).includes(this.udid);
  }

  private async ui(args: string[]): Promise<string> {
    return runTool({ command: this.idb, args: ['ui', ...args, '--udid', this.udid] });
  }

  private async showWindow(): Promise<void> {
    if (this.place === null) return;

    const developer = (await runTool({ command: 'xcode-select', args: ['-p'] })).trim();
    const found = await Promise.all(
      simulatorAppsOf(developer).map(async (app) =>
        (await access(app.path).then(
          () => true,
          () => false,
        ))
          ? app
          : null,
      ),
    );
    const app = found.find((one) => one !== null);

    if (app === undefined) return;

    this.simulatorApp = app.process;
    this.isSimulatorOurs = !(await this.isSimulatorOpen());
    await runTool({
      command: 'open',
      args: ['-a', app.path, '--args', '-CurrentDeviceUDID', this.udid],
    });
    this.watching = setInterval(() => {
      void this.isSimulatorOpen().then((isOpen) => {
        if (this.watching === null || isOpen) return;

        clearInterval(this.watching);
        this.watching = null;
        this.onClosed?.();
      });
    }, IOS.watchMs);
  }

  private isSimulatorOpen(): Promise<boolean> {
    if (this.simulatorApp === null) return Promise.resolve(false);

    return runTool({ command: 'pgrep', args: ['-x', this.simulatorApp] }).then(
      () => true,
      () => false,
    );
  }

  private async simctl(args: string[]): Promise<string> {
    return runTool({ command: 'xcrun', args: ['simctl', ...args] });
  }

  private async settle(): Promise<void> {
    await new Promise((wake) => setTimeout(wake, IOS.settleMs));
  }
}
