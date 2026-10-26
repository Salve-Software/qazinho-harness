import { describe, expect, it } from 'vitest';
import { phoneMeasureOf } from '@/engine/devices/library';

const SCREEN = { x: 0, y: 0, width: 1080, height: 2400 };
const CARD = { x: 42, y: 420, width: 1008, height: 630 };
const TITLE = { x: 84, y: 462, width: 600, height: 63 };
const BUTTON = { x: 84, y: 567, width: 420, height: 126 };

describe('phoneMeasureOf', () => {
  it('measures in dp at the screen’s density, inside the smallest box around it', () => {
    expect(
      phoneMeasureOf({
        role: 'Button',
        text: 'Pay',
        box: BUTTON,
        others: [SCREEN, CARD, TITLE],
        unit: 'dp',
        scale: 160 / 420,
      }),
    ).toEqual({
      role: 'Button',
      text: 'Pay',
      unit: 'dp',
      box: { x: 32, y: 216, width: 160, height: 48 },
      parent: { x: 16, y: 160, width: 384, height: 240 },
      gaps: { above: 16, below: null, left: null, right: null },
      style: null,
    });
  });

  it('has no box around something nothing holds', () => {
    expect(
      phoneMeasureOf({
        role: 'Window',
        text: '',
        box: SCREEN,
        others: [CARD],
        unit: 'pt',
        scale: 1,
      }).parent,
    ).toBeNull();
  });
});
