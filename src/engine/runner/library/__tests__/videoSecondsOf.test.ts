import { describe, expect, it } from 'vitest';
import { videoSecondsOf } from '@/engine/runner/library';

describe('videoSecondsOf', () => {
  it('places a moment in seconds from when the video began, to the hundredth', () => {
    expect(videoSecondsOf({ at: 12_346, startedAt: 0 })).toBe(12.35);
  });

  it('places a moment from before the video began at its start', () => {
    expect(videoSecondsOf({ at: 500, startedAt: 1_000 })).toBe(0);
  });
});
