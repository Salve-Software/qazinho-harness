import { describe, expect, it } from 'vitest';
import { pointOf } from '@/engine/devices/library';

const size = { width: 1080, height: 2400 };

describe('the pixel a fraction of the screen falls on', () => {
  it('turns fractions into the pixels of the screen', () => {
    expect(pointOf({ x: 0.5, y: 0.25, size })).toEqual({ x: 540, y: 600 });
  });

  it('never leaves the screen, whatever the fraction', () => {
    expect(pointOf({ x: -0.2, y: 1.4, size })).toEqual({ x: 0, y: 2399 });
    expect(pointOf({ x: Number.NaN, y: 1, size })).toEqual({ x: 0, y: 2399 });
  });
});
