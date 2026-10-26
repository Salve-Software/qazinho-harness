import { describe, expect, it } from 'vitest';
import { framesDueOf } from '@/engine/devices/FrameRecorder';

describe('framesDueOf', () => {
  it('owes the first frame at the start', () => {
    expect(framesDueOf({ startedAt: 1_000, now: 1_000, fps: 10 })).toBe(1);
  });

  it('owes a frame each tick since, so the video keeps the wall clock', () => {
    expect(framesDueOf({ startedAt: 1_000, now: 2_050, fps: 10 })).toBe(11);
  });

  it('owes the frames a late tick missed', () => {
    expect(framesDueOf({ startedAt: 0, now: 5_000, fps: 10 })).toBe(51);
  });
});
