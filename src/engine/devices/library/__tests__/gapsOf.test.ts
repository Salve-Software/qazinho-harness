import { describe, expect, it } from 'vitest';
import { gapsOf } from '@/engine/devices/library';

const BUTTON = { x: 24, y: 600, width: 342, height: 48 };

describe('gapsOf', () => {
  it('measures to the nearest thing on each side', () => {
    expect(
      gapsOf({
        box: BUTTON,
        others: [
          { x: 24, y: 560, width: 342, height: 24 },
          { x: 24, y: 500, width: 342, height: 24 },
          { x: 24, y: 672, width: 100, height: 20 },
          { x: 0, y: 610, width: 16, height: 20 },
          { x: 380, y: 600, width: 10, height: 48 },
        ],
      }),
    ).toEqual({ above: 16, below: 24, left: 8, right: 14 });
  });

  it('does NOT count the box it sits in, nor something off to a corner', () => {
    expect(
      gapsOf({
        box: BUTTON,
        others: [
          { x: 0, y: 0, width: 390, height: 844 },
          { x: 380, y: 400, width: 10, height: 10 },
        ],
      }),
    ).toEqual({ above: null, below: null, left: null, right: null });
  });

  it('reads two things that touch as no space between them', () => {
    expect(
      gapsOf({ box: BUTTON, others: [{ x: 24, y: 648, width: 342, height: 10 }] }).below,
    ).toBe(0);
  });
});
