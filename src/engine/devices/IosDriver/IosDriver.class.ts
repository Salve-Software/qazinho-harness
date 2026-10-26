import type { IIosDriver } from './types';
import type {
  IActionMotion,
  IDeviceImage,
  IRunVideo,
  IStepAction,
  IViewport,
} from '@/contract';
import type { IDeviceDriver, IShot, ShrinkImage } from '@/engine/devices/types';
import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RUN_VIDEO_FILES } from '@/engine/devices/constants';
import {
  describeMeasure,
  mp4FactsOf,
  phoneGlance,
  phoneMeasureOf,
  phoneShot,
  swipeOf,
} from '@/engine/devices/library';
import { IOS } from './constants';
import {
  bundleOfPlist,
  describeIosScreen,
  findElement,
  parseBooted,
  parseElements,
  runTool,
  screenOf,
} from './library';

/** Drives an iOS simulator. simctl boots and installs; only idb can touch the screen. */
export class IosDriver implements IDeviceDriver {
  private readonly idb: string;
  private readonly udid: string;
  private readonly app: string;
  private readonly shrink: ShrinkImage | null;
  private bundle = '';
  private isOurs = false;
  private recording: { process: ChildProcess; file: string; startedAt: number } | null =
    null;

  public constructor(props: IIosDriver) {
    this.idb = props.idb;
    this.udid = props.udid;
    this.app = props.app;
    this.shrink = props.shrink ?? null;
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
  }

  /** Starts the app over on a fresh install: a simulator keeps an app's data until the app is removed. */
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

    if (action.kind === 'hover' || action.kind === 'upload')
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

  /** One thing on the screen measured to hold it to a design: its box in points, the box around it and the space to its neighbours. */
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

  /** The simulator's screen as the agent reads it, through a file simctl writes and QAzinho removes. */
  public async glance(): Promise<IDeviceImage | null> {
    const file = join(tmpdir(), `qazinho-glance-${randomUUID()}.png`);

    try {
      await this.simctl(['io', this.udid, 'screenshot', file]);

      return phoneGlance({ image: await readFile(file), shrink: this.shrink });
    } finally {
      await rm(file, { force: true });
    }
  }

  /** A simulator has no layout-shift timeline to read, so it says nothing about motion. */
  public async motion(): Promise<IActionMotion | null> {
    return Promise.resolve(null);
  }

  /** A simulator keeps the size of the device it is, so a new window size changes nothing. */
  public async resize(_viewport: IViewport): Promise<void> {
    return Promise.resolve();
  }

  /** A simulator is not streamed, so watching it up close changes nothing. */
  public async focus(): Promise<void> {
    return Promise.resolve();
  }

  /** The simulator's screen kept in the run, as a JPEG at its full size. */
  public async shoot(file: string): Promise<IShot | null> {
    await this.simctl(['io', this.udid, 'screenshot', file]);

    const shot = phoneShot({ image: await readFile(file), shrink: this.shrink });

    await writeFile(file, shot.bytes);

    return {
      file,
      dataUrl: `data:${shot.mimeType};base64,${shot.bytes.toString('base64')}`,
    };
  }

  /** QAzinho only shuts down what QAzinho started: a simulator the QA opened stays open. */
  public async stream(): Promise<boolean> {
    return Promise.resolve(false);
  }

  /** Records the simulator's screen into the run's folder until stopped, from the moment simctl says it started. */
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

  /** Ends the recording the way simctl writes its file whole, and reads how long and how large it came out. */
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

  private async simctl(args: string[]): Promise<string> {
    return runTool({ command: 'xcrun', args: ['simctl', ...args] });
  }

  private async settle(): Promise<void> {
    await new Promise((wake) => setTimeout(wake, IOS.settleMs));
  }
}
