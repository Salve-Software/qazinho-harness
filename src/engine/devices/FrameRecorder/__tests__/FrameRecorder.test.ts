import { execFileSync } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FrameRecorder } from '@/engine/devices/FrameRecorder';
import { findOnPath } from '@/engine/library';

const FFMPEG = findOnPath({
  command: 'ffmpeg',
  directories: (process.env.PATH ?? '').split(delimiter),
});

/**
 * Um frame que o próprio ffmpeg desenhou, para o teste não precisar de imagem própria.
 */
function frameOf(ffmpeg: string): Buffer {
  return execFileSync(ffmpeg, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-f',
    'lavfi',
    '-i',
    'color=c=lime:s=320x200',
    '-frames:v',
    '1',
    '-f',
    'mjpeg',
    '-',
  ]);
}

describe('FrameRecorder', () => {
  it('records nothing it was never handed a frame for', async () => {
    const recorder = new FrameRecorder({ ffmpeg: '/nowhere/ffmpeg' });

    recorder.start(join(tmpdir(), 'never.mp4'));

    expect(await recorder.stop()).toBeNull();
  });

  it.skipIf(FFMPEG === null)(
    'writes the frames it is handed into an MP4 as long as the wall clock ran',
    async () => {
      const ffmpeg = FFMPEG ?? '';
      const frame = frameOf(ffmpeg);
      const file = join(await mkdtemp(join(tmpdir(), 'qazinho-frames-')), 'run.mp4');
      const recorder = new FrameRecorder({ ffmpeg });
      const began = Date.now();

      recorder.start(file);
      recorder.push(frame);
      await new Promise((wake) => setTimeout(wake, 1_200));
      recorder.push(frame);

      const video = await recorder.stop();

      expect(video).toMatchObject({ width: 320, height: 200 });
      expect(video?.startedAt).toBeGreaterThanOrEqual(began);
      expect(video?.durationMs).toBeGreaterThanOrEqual(1_100);
    },
  );
});
