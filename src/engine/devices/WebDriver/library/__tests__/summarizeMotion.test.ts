import { describe, expect, it } from 'vitest';
import { summarizeMotion } from '@/engine/devices/WebDriver/library';

describe('summarizeMotion', () => {
  it('adds the shifts up, and keeps apart those no input explains', () => {
    expect(
      summarizeMotion({
        shifts: [
          { value: 0.1, hadInput: true },
          { value: 0.2, hadInput: false },
          { value: 0.0004, hadInput: false },
        ],
        frames: [],
      }),
    ).toMatchObject({ shift: 0.3, unexpectedShift: 0.2, shifts: 3 });
  });

  it('counts the long frames and keeps the slowest, rounded', () => {
    expect(
      summarizeMotion({ shifts: [], frames: [{ ms: 64.2 }, { ms: 181.6 }] }),
    ).toMatchObject({
      longFrames: 2,
      slowestFrameMs: 182,
    });
  });

  it('reads an action where nothing moved as all zeros', () => {
    expect(summarizeMotion({ shifts: [], frames: [] })).toEqual({
      shift: 0,
      unexpectedShift: 0,
      shifts: 0,
      longFrames: 0,
      slowestFrameMs: 0,
    });
  });
});
