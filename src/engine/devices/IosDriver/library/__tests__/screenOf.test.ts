import { describe, expect, it } from 'vitest';
import { screenOf } from '@/engine/devices/IosDriver/library';

const APP = { type: 'Application', frame: { x: 0, y: 0, width: 402, height: 874 } };
const BUTTON = {
  type: 'Button',
  AXLabel: 'Save',
  frame: { x: 20, y: 100, width: 80, height: 40 },
};

describe('screenOf', () => {
  it('reads the screen off the app at the root, from a document or one element per line', () => {
    expect(screenOf(JSON.stringify([APP, BUTTON]))).toEqual({ width: 402, height: 874 });
    expect(screenOf([JSON.stringify(APP), JSON.stringify(BUTTON)].join('\n'))).toEqual({
      width: 402,
      height: 874,
    });
  });

  it('gives null when axe lists no app, or said nothing', () => {
    expect(screenOf(JSON.stringify([BUTTON]))).toBeNull();
    expect(screenOf('')).toBeNull();
  });
});
