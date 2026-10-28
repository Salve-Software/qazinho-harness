import type { IAndroidDriver } from './types';
import type {
  IActionMotion,
  IDeviceImage,
  IRunVideo,
  IStepAction,
  IViewport,
} from '@/contract';
import type { IDeviceDriver, IShot, ShrinkImage } from '@/engine/devices/types';
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RUN_VIDEO_FILES } from '@/engine/devices/constants';
import {
  describeMeasure,
  phoneGlance,
  phoneMeasureOf,
  phoneShot,
  swipeOf,
} from '@/engine/devices/library';
import { spawnCommand } from '@/engine/library';
import { ANDROID } from './constants';
import {
  adbTextsOf,
  bootArgs,
  densityOf,
  describeScreen,
  findNode,
  frontPackage,
  launchArgs,
  needsReinstall,
  newestBuildTools,
  packageOfApk,
  parseDevices,
  parseViewHierarchy,
  runAdb,
  runAdbRaw,
  screenSizeOf,
} from './library';

/** Dirige um emulador Android pelo adb. O QA vê o celular trabalhar. */
export class AndroidDriver implements IDeviceDriver {
  private readonly sdkRoot: string;
  private readonly avd: string;
  private readonly apk: string;
  private readonly shrink: ShrinkImage | null;
  private serial = '';
  private app = '';
  private isOurs = false;
  private recording: { file: string; startedAt: number } | null = null;
  private density: number | null = null;

  public constructor(props: IAndroidDriver) {
    this.sdkRoot = props.sdkRoot;
    this.avd = props.avd;
    this.apk = props.apk;
    this.shrink = props.shrink ?? null;
  }

  public async open(): Promise<void> {
    this.serial = (await this.running())[0] ?? (await this.boot());
    this.app = await this.install();

    await this.launchFresh();
  }

  /** Começa o app do zero com os dados limpos, como no dia em que foi instalado. */
  public async restart(): Promise<void> {
    if (this.serial.length === 0) throw new Error('The emulator is not open.');

    await this.launchFresh();
  }

  public async act(action: IStepAction): Promise<void> {
    if (this.serial.length === 0) throw new Error('The emulator is not open.');

    if (action.kind === 'wait') {
      await new Promise((wake) =>
        setTimeout(wake, Number(action.value) || ANDROID.waitMs),
      );

      return;
    }

    if (action.kind === 'press') {
      await this.shell(['input', 'keyevent', this.keyOf(action.target)]);
      await this.settle();

      return;
    }

    if (action.kind === 'goto') {
      await this.launch();

      return;
    }

    if (action.kind === 'reopen') {
      await this.shell(['am', 'force-stop', this.app]);
      await this.launch();

      return;
    }

    if (action.kind === 'scroll') {
      await this.scroll({ direction: action.value, until: action.target });

      return;
    }

    if (action.kind === 'hover' || action.kind === 'upload')
      throw new Error(ANDROID.notOnPhone[action.kind]);

    const nodes = await this.read();
    const node = findNode({ nodes, target: action.target });

    if (!node) throw new Error(`Nothing on the screen answers to "${action.target}".`);

    if (action.kind === 'long_press') {
      const [x, y] = [String(node.x), String(node.y)];

      await this.shell(['input', 'swipe', x, y, x, y, String(ANDROID.longPressMs)]);
      await this.settle();

      return;
    }

    if (action.kind === 'drag') {
      const drop = findNode({ nodes, target: action.value });

      if (!drop) throw new Error(`Nothing on the screen answers to "${action.value}".`);

      const points = [node.x, node.y, drop.x, drop.y].map(String);

      await this.shell(['input', 'draganddrop', ...points, String(ANDROID.dragMs)]).catch(
        () => this.shell(['input', 'swipe', ...points, String(ANDROID.dragMs)]),
      );
      await this.settle();

      return;
    }

    if (action.kind === 'fill' && action.value.includes('"'))
      throw new Error(ANDROID.noDoubleQuote);

    await this.shell(['input', 'tap', String(node.x), String(node.y)]);

    if (action.kind === 'fill') {
      await this.settle();

      for (const chunk of adbTextsOf(action.value))
        await this.shell(['input', 'text', chunk]);
    }

    await this.settle();
  }

  public async describe(): Promise<string> {
    const focused = await this.shell(['dumpsys', 'window']).catch(() => '');

    return describeScreen({
      nodes: await this.read(),
      app: frontPackage(focused) || this.app,
    });
  }

  /**
   * Uma coisa da tela medida para conferir com um design: a caixa em dp na densidade da
   * tela, a caixa em volta e o espaço até os vizinhos.
   */
  public async inspect(target: string): Promise<string> {
    const nodes = await this.read();
    const node = findNode({ nodes, target });

    if (!node) throw new Error(`Nothing on the screen reads "${target}".`);

    this.density ??= densityOf(await this.shell(['wm', 'density']).catch(() => ''));

    return describeMeasure(
      phoneMeasureOf({
        role: node.role,
        text: node.text || node.desc || node.id,
        box: node.box,
        others: nodes.filter((one) => one !== node).map(({ box }) => box),
        unit: 'dp',
        scale: ANDROID.baselineDensity / this.density,
      }),
    );
  }

  /**
   * A tela do emulador como o agente a lê, pelo screencap, reduzida ao que o agente
   * precisa.
   */
  public async glance(): Promise<IDeviceImage | null> {
    if (this.serial.length === 0) return null;

    const image = await this.raw(['exec-out', 'screencap', '-p']);

    return phoneGlance({ image, shrink: this.shrink });
  }

  /**
   * Um celular não tem linha do tempo de deslocamento de layout para ler, então não diz
   * nada sobre movimento.
   */
  public async motion(): Promise<IActionMotion | null> {
    return Promise.resolve(null);
  }

  /**
   * Um emulador mantém o tamanho do aparelho que ele é, então um novo tamanho de janela
   * não muda nada.
   */
  public async resize(_viewport: IViewport): Promise<void> {
    return Promise.resolve();
  }

  /** Um emulador não é transmitido, então vê-lo de perto não muda nada. */
  public async focus(): Promise<void> {
    return Promise.resolve();
  }

  /** A tela do emulador guardada na run, como JPEG no tamanho cheio. */
  public async shoot(file: string): Promise<IShot | null> {
    if (this.serial.length === 0) return null;

    const shot = phoneShot({
      image: await this.raw(['exec-out', 'screencap', '-p']),
      shrink: this.shrink,
    });

    await writeFile(file, shot.bytes);

    return {
      file,
      dataUrl: `data:${shot.mimeType};base64,${shot.bytes.toString('base64')}`,
    };
  }

  /**
   * O QAzinho só desliga o que o QAzinho iniciou: um emulador que o QA abriu continua
   * aberto.
   */
  public async stream(): Promise<boolean> {
    return Promise.resolve(false);
  }

  /**
   * Grava a tela do emulador na pasta da run pelo console dele, pelo tempo que o console
   * permite.
   */
  public async record(folder: string): Promise<boolean> {
    const file = join(folder, RUN_VIDEO_FILES.webm);
    const said = await this.adb([
      'emu',
      'screenrecord',
      'start',
      '--time-limit',
      String(ANDROID.recordLimitSec),
      file,
    ]).catch(() => '');

    if (!said.trim().startsWith('OK')) return false;

    this.recording = { file, startedAt: Date.now() };

    return true;
  }

  /**
   * Termina a gravação, espera o emulador escrever o arquivo, e diz quanto tempo durou e
   * o tamanho da tela.
   */
  public async stopRecording(): Promise<IRunVideo | null> {
    const recording = this.recording;

    this.recording = null;

    if (recording === null) return null;

    const stoppedAt = Date.now();

    await this.adb(['emu', 'screenrecord', 'stop']).catch(() => '');
    await new Promise((wake) => setTimeout(wake, ANDROID.recordSettleMs));

    const written = await stat(recording.file).catch(() => null);

    if (written === null || written.size === 0) return null;

    const size = screenSizeOf(await this.shell(['wm', 'size']).catch(() => ''));

    return {
      startedAt: recording.startedAt,
      durationMs: stoppedAt - recording.startedAt,
      width: size?.width ?? 0,
      height: size?.height ?? 0,
    };
  }

  /**
   * Desliga um emulador que o QAzinho iniciou, e espera ele sumir, para a próxima run ou
   * olhada nunca o achar meio desligado.
   */
  public async close(): Promise<void> {
    if (this.isOurs && this.serial.length > 0) {
      await this.adb(['emu', 'kill']).catch(() => '');
      await this.gone();
    }

    this.serial = '';
    this.isOurs = false;
  }

  private async launchFresh(): Promise<void> {
    await this.shell(['am', 'force-stop', this.app]);
    await this.shell(['pm', 'clear', this.app]);
    await this.launch();
  }

  private async launch(): Promise<void> {
    await this.shell(launchArgs(this.app));
    await this.settle();
  }

  private async boot(): Promise<string> {
    const emulator = join(this.sdkRoot, 'emulator', 'emulator');

    spawnCommand({
      command: emulator,
      args: bootArgs(this.avd),
      options: {
        detached: true,
        stdio: 'ignore',
      },
    }).unref();

    this.isOurs = true;

    const until = Date.now() + ANDROID.bootTimeoutMs;

    while (Date.now() < until) {
      const [serial] = await this.running();

      if (serial !== undefined) {
        const booted = await runAdb({
          adb: this.adbPath(),
          args: ['-s', serial, 'shell', 'getprop', 'sys.boot_completed'],
        }).catch(() => '');

        if (booted.trim() === '1') return serial;
      }

      await new Promise((wake) => setTimeout(wake, ANDROID.waitMs));
    }

    throw new Error(`The emulator ${this.avd} did not finish booting.`);
  }

  private async install(): Promise<string> {
    const tools = newestBuildTools(
      await readdir(join(this.sdkRoot, 'build-tools')).catch(() => []),
    );

    if (tools === null)
      throw new Error(
        'No build-tools in the Android SDK, so QAzinho cannot read the apk.',
      );

    const dumped = await runAdb({
      adb: join(this.sdkRoot, 'build-tools', tools, 'aapt2'),
      args: ['dump', 'packagename', this.apk],
    });

    const app = packageOfApk(dumped);

    if (app === null) throw new Error(`${this.apk} does not name a package.`);

    await this.adb(['install', '-r', '-t', this.apk]).catch(async (reason: unknown) => {
      if (!needsReinstall(String(reason))) throw reason;

      await this.adb(['uninstall', app]);
      await this.adb(['install', '-t', this.apk]);
    });

    return app;
  }

  private async read() {
    await this.shell(['uiautomator', 'dump', ANDROID.dumpFile]);

    return parseViewHierarchy(await this.shell(['cat', ANDROID.dumpFile]));
  }

  private async scroll(props: { direction: string; until: string }): Promise<void> {
    const size = screenSizeOf(await this.shell(['wm', 'size']).catch(() => ''));

    if (size === null) throw new Error('The emulator did not say how big its screen is.');

    const { from, to } = swipeOf({ size, direction: props.direction });
    const until = props.until.trim();
    const swipe = async () => {
      await this.shell([
        'input',
        'swipe',
        ...[from.x, from.y, to.x, to.y].map(String),
        String(ANDROID.swipeMs),
      ]);
      await this.settle();
    };

    if (until === '') {
      await swipe();

      return;
    }

    const isShown = async () => {
      const found = findNode({ nodes: await this.read(), target: until });

      return (
        found !== null &&
        found !== undefined &&
        found.x >= 0 &&
        found.y >= 0 &&
        found.x <= size.width &&
        found.y <= size.height
      );
    };

    for (let tries = 0; tries < ANDROID.scrollTries; tries += 1) {
      if (await isShown()) return;

      await swipe();
    }

    if (await isShown()) return;

    throw new Error(
      `Nothing on the screen reads "${until}" after scrolling ${props.direction}.`,
    );
  }

  private async gone(): Promise<void> {
    const until = Date.now() + ANDROID.shutdownTimeoutMs;

    while (Date.now() < until) {
      const listed = await runAdb({ adb: this.adbPath(), args: ['devices'] }).catch(
        () => '',
      );

      if (!listed.includes(this.serial)) return;

      await new Promise((wake) => setTimeout(wake, ANDROID.waitMs));
    }
  }

  private async running(): Promise<string[]> {
    return parseDevices(await this.adb(['devices']).catch(() => ''));
  }

  private keyOf(target: string): string {
    return ANDROID.keys[target.toLowerCase()] ?? 'KEYCODE_ENTER';
  }

  private adbPath(): string {
    return join(this.sdkRoot, 'platform-tools', 'adb');
  }

  private async adb(args: string[]): Promise<string> {
    return runAdb({ adb: this.adbPath(), args: this.addressed(args) });
  }

  private async shell(args: string[]): Promise<string> {
    return this.adb(['shell', ...args]);
  }

  private async raw(args: string[]): Promise<Buffer> {
    return runAdbRaw({ adb: this.adbPath(), args: this.addressed(args) });
  }

  private addressed(args: string[]): string[] {
    return this.serial.length > 0 ? ['-s', this.serial, ...args] : args;
  }

  private async settle(): Promise<void> {
    await new Promise((wake) => setTimeout(wake, ANDROID.settleMs));
  }
}
