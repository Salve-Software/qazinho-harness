import { describe, expect, it } from 'vitest';
import { swipeOf } from '@/engine/devices/library';

const SIZE = { width: 1000, height: 2000 };

describe('swipeOf', () => {
  it('moves the finger up the middle of the screen to show what is below', () => {
    expect(swipeOf({ size: SIZE, direction: 'down' })).toEqual({
      from: { x: 500, y: 1400 },
      to: { x: 500, y: 600 },
    });
  });

  it('moves it the other way for up, and across for the sides', () => {
    expect(swipeOf({ size: SIZE, direction: 'up' })).toEqual({
      from: { x: 500, y: 600 },
      to: { x: 500, y: 1400 },
    });
    expect(swipeOf({ size: SIZE, direction: 'right' })).toEqual({
      from: { x: 800, y: 1000 },
      to: { x: 200, y: 1000 },
    });
    expect(swipeOf({ size: SIZE, direction: 'left' })).toEqual({
      from: { x: 200, y: 1000 },
      to: { x: 800, y: 1000 },
    });
  });

  it('reads a direction it does not know as down', () => {
    expect(swipeOf({ size: SIZE, direction: 'sideways' })).toEqual(
      swipeOf({ size: SIZE, direction: 'down' }),
    );
  });
});
