import { describe, expect, it } from 'vitest';
import { centreOf } from '@/engine/devices/AndroidDriver/library';

describe('centreOf', () => {
  it('lands a finger in the middle of the box', () => {
    expect(centreOf('[0,0][1080,2160]')).toEqual({ x: 540, y: 1080 });
  });

  it('a box of no size is nowhere to tap', () => {
    expect(centreOf('[10,10][10,10]')).toBeNull();
  });

  it('a box turned inside out is nowhere to tap either', () => {
    expect(centreOf('[100,100][10,10]')).toBeNull();
  });

  it('anything that is not a box is nowhere to tap', () => {
    expect(centreOf('')).toBeNull();
  });
});
