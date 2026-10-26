import { describe, expect, it } from 'vitest';
import { ffmpegArgsOf } from '@/engine/devices/FrameRecorder';

describe('ffmpegArgsOf', () => {
  it('reads JPEG frames from its input at the rate asked, and writes an H.264 MP4 that streams', () => {
    const args = ffmpegArgsOf({ file: '/runs/r1/run.mp4', fps: 10, crf: 28 });

    expect(args.slice(args.indexOf('-f'), args.indexOf('-i') + 2)).toEqual([
      '-f',
      'image2pipe',
      '-framerate',
      '10',
      '-c:v',
      'mjpeg',
      '-i',
      '-',
    ]);
    expect(args).toContain('libx264');
    expect(args).toContain('+faststart');
    expect(args.at(-1)).toBe('/runs/r1/run.mp4');
  });

  it('makes both sides even, which H.264 needs', () => {
    const args = ffmpegArgsOf({ file: 'a.mp4', fps: 10, crf: 28 });

    expect(args[args.indexOf('-vf') + 1]).toBe('scale=trunc(iw/2)*2:trunc(ih/2)*2');
  });
});
