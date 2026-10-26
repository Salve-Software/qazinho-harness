import type { IFrameRecorder } from './types';
import type { IRunVideo } from '@/contract';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { mp4FactsOf } from '@/engine/devices/library';
import { spawnCommand } from '@/engine/library';
import { FRAME_RECORDER } from './constants';
import { ffmpegArgsOf, framesDueOf } from './library';

/** Records a browser's live frames into an MP4 through the machine's ffmpeg, at a steady rate with each frame held until the next: what a CI machine records a web run with, having no window to encode in. */
export class FrameRecorder {
  private readonly ffmpeg: string;
  private readonly fps: number;
  private child: ChildProcessWithoutNullStreams | null = null;
  private file = '';
  private latest: Buffer | null = null;
  private timer: NodeJS.Timeout | null = null;
  private startedAt = 0;
  private written = 0;

  public constructor(props: IFrameRecorder) {
    this.ffmpeg = props.ffmpeg;
    this.fps = props.fps ?? FRAME_RECORDER.fps;
  }

  /** Starts writing `file`; the clock starts with the first frame pushed. */
  public start(file: string): void {
    this.file = file;
    this.latest = null;
    this.written = 0;
    this.child = spawnCommand({
      command: this.ffmpeg,
      args: ffmpegArgsOf({ file, fps: this.fps, crf: FRAME_RECORDER.crf }),
      options: { stdio: ['pipe', 'ignore', 'pipe'] },
    });
    this.child.stdin.on('error', () => undefined);
    this.child.once('error', () => {
      this.child = null;
    });
  }

  /** Takes the newest frame, which the video holds until another comes. */
  public push(jpeg: Buffer): void {
    if (this.child === null) return;

    this.latest = jpeg;

    if (this.timer !== null) return;

    this.startedAt = Date.now();
    this.catchUp();
    this.timer = setInterval(() => {
      this.catchUp();
    }, 1000 / this.fps);
  }

  /** Ends the file and says when its first frame showed, how long it plays and how large it is, read from the file; null when nothing was recorded. */
  public async stop(): Promise<IRunVideo | null> {
    const child = this.child;

    if (this.timer !== null) {
      this.catchUp();
      clearInterval(this.timer);
    }

    this.timer = null;
    this.child = null;

    if (child === null) return null;

    const closed = new Promise<void>((done) => {
      child.once('close', () => {
        done();
      });
    });

    child.stdin.end();
    await Promise.race([
      closed,
      new Promise((wake) => setTimeout(wake, FRAME_RECORDER.stopWaitMs)),
    ]);

    if (this.written === 0) return null;

    const facts = mp4FactsOf(await readFile(this.file).catch(() => null));

    return facts === null ? null : { startedAt: this.startedAt, ...facts };
  }

  private catchUp(): void {
    const frame = this.latest;

    if (this.child === null || frame === null) return;

    const due = framesDueOf({
      startedAt: this.startedAt,
      now: Date.now(),
      fps: this.fps,
    });

    for (; this.written < due; this.written += 1) this.child.stdin.write(frame);
  }
}
