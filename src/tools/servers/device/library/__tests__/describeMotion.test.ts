import type { IActionMotion } from '@/contract';
import { describe, expect, it } from 'vitest';
import { describeMotion } from '@/tools/servers/device/library';

const STILL: IActionMotion = {
  shift: 0,
  unexpectedShift: 0,
  shifts: 0,
  longFrames: 0,
  slowestFrameMs: 0,
};

describe('describeMotion', () => {
  it('says the page held still when nothing moved past the limits', () => {
    expect(
      describeMotion({
        ...STILL,
        shift: 0.004,
        shifts: 1,
        longFrames: 1,
        slowestFrameMs: 60,
      }),
    ).toBe('The page held still while it acted.');
  });

  it('names a shift no input explains, the kind a person notices as a jump', () => {
    expect(
      describeMotion({ ...STILL, shift: 0.31, unexpectedShift: 0.25, shifts: 3 }),
    ).toBe(
      'While it acted, the layout shifted 0.31 in 3 moves, 0.25 of it with no input to explain it.',
    );
  });

  it('tells a shift right after the input apart, which browsers treat as expected', () => {
    expect(describeMotion({ ...STILL, shift: 0.2, shifts: 1 })).toContain(
      'all right after the input',
    );
  });

  it('counts one move or one frame in the singular', () => {
    expect(
      describeMotion({
        ...STILL,
        shift: 0.2,
        unexpectedShift: 0.2,
        shifts: 1,
        longFrames: 1,
        slowestFrameMs: 150,
      }),
    ).toBe(
      'While it acted, the layout shifted 0.20 in 1 move, 0.20 of it with no input to explain it, and 1 frame ran long, the slowest 150 ms.',
    );
  });

  it('names frames that ran long, with the slowest', () => {
    expect(describeMotion({ ...STILL, longFrames: 2, slowestFrameMs: 180 })).toBe(
      'While it acted, 2 frames ran long, the slowest 180 ms.',
    );
  });

  it('says nothing when there is no reading at all', () => {
    expect(describeMotion(null)).toBeNull();
  });
});
