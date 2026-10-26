import type { IElementMeasure } from '@/engine/devices/types';
import { describe, expect, it } from 'vitest';
import { describeMeasure } from '@/engine/devices/library';

const PAY: IElementMeasure = {
  role: 'button',
  text: 'Pay',
  unit: 'px',
  box: { x: 24, y: 612.4, width: 342, height: 48 },
  parent: { x: 16, y: 120, width: 358, height: 620 },
  gaps: { above: 16, below: null, left: 8, right: 8 },
  style: {
    font: 'Inter, sans-serif',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '24px',
    letterSpacing: 'normal',
    color: 'rgb(255, 255, 255)',
    background: 'rgb(31, 111, 235)',
    padding: '12px 16px',
    margin: '0px',
    border: '1px solid rgb(0, 0, 0)',
    radius: '8px',
    gap: 'normal',
    opacity: '1',
  },
};

describe('describeMeasure', () => {
  it('says the box, the space around it, and the browser’s type, colours and spacing', () => {
    expect(describeMeasure(PAY)).toBe(
      [
        '"Pay" (button), measured in CSS px:',
        'box: x 24, y 612, 342 × 48',
        'inside: x 16, y 120, 358 × 620',
        'space around: 16 above, nothing below, 8 left, 8 right',
        'type: Inter, sans-serif, 16px / line 24px, weight 600, letter-spacing normal',
        'colour: #FFFFFF on #1F6FEB',
        'padding 12px 16px · margin 0px · border 1px solid #000000 · corners 8px · gap normal · opacity 1',
      ].join('\n'),
    );
  });

  it('says in which unit a phone measured, and that it cannot read the style', () => {
    const text = describeMeasure({ ...PAY, unit: 'dp', style: null, parent: null });

    expect(text).toContain('measured in dp');
    expect(text).not.toContain('inside:');
    expect(text).toContain('does not say its type, colours or inner spacing');
  });

  it('names something with no words by its role', () => {
    expect(describeMeasure({ ...PAY, text: '' }).split('\n')[0]).toBe(
      'button, measured in CSS px:',
    );
  });
});
