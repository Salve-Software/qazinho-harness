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

  it('reads one element per line as well as one document', () => {
    const lines = [JSON.stringify(ONE), JSON.stringify({ ...ONE, AXLabel: 'Cancel' })];

    expect(parseElements(lines.join('\n')).map(({ label }) => label)).toEqual([
      'Sign in',
      'Cancel',
    ]);
  });

  it("tells an app's icon on the home screen from the app's own controls", () => {
    const icon = { ...ONE, AXLabel: 'Safari', traits: ['Scrollable', 'LaunchIcon'] };

    expect(
      parseElements(JSON.stringify([ONE, icon])).map(({ isLaunchIcon }) => isLaunchIcon),
    ).toEqual([false, true]);
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

  it('a line that is not an element is skipped, and the rest still read', () => {
    const mixed = ['not json', JSON.stringify(ONE)].join('\n');

    expect(parseElements(mixed)).toHaveLength(1);
  });

  it('idb saying nothing is an empty screen, not a crash', () => {
    expect(parseElements('')).toEqual([]);
  });
});
