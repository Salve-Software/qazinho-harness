import { describe, expect, it } from 'vitest';
import { parseElements } from '@/engine/devices/IosDriver/library';

const ONE = {
  AXLabel: 'Sign in',
  type: 'Button',
  frame: { x: 20, y: 100, width: 200, height: 44 },
};

describe('parseElements', () => {
  it('lands a finger in the middle of the frame', () => {
    expect(parseElements(JSON.stringify([ONE]))[0]).toMatchObject({
      label: 'Sign in',
      x: 120,
      y: 122,
    });
  });

  it('flattens the tree, so a control nested under the app is reachable too', () => {
    const tree = [
      {
        type: 'Application',
        AXLabel: null,
        frame: { x: 0, y: 0, width: 402, height: 874 },
        children: [{ ...ONE, AXLabel: 'Cancel' }],
      },
    ];

    expect(parseElements(JSON.stringify(tree)).map(({ label }) => label)).toContain(
      'Cancel',
    );
  });

  it('falls back to the value when an element carries no label', () => {
    const valued = { ...ONE, AXLabel: null, AXValue: 'j@shop.test' };

    expect(parseElements(JSON.stringify([valued]))[0]?.label).toBe('j@shop.test');
  });

  it('an element with no frame is nowhere to tap', () => {
    expect(parseElements(JSON.stringify([{ AXLabel: 'ghost' }]))).toEqual([]);
  });

  it('an element with no size is nowhere to tap either', () => {
    const flat = { ...ONE, frame: { x: 0, y: 0, width: 0, height: 0 } };

    expect(parseElements(JSON.stringify([flat]))).toEqual([]);
  });

  it('output that is not JSON is an empty screen, not a crash', () => {
    expect(parseElements('axe: no running simulator with that udid')).toEqual([]);
  });

  it('axe saying nothing is an empty screen, not a crash', () => {
    expect(parseElements('')).toEqual([]);
  });
});
