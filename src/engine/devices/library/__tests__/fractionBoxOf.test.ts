import { describe, expect, it } from 'vitest';
import { fractionBoxOf } from '@/engine/devices/library';

const screen = { width: 1000, height: 500 };

describe('a box as fractions of the screen', () => {
  it('turns pixels into fractions', () => {
    expect(
      fractionBoxOf({ box: { x: 100, y: 50, width: 500, height: 250 }, screen }),
    ).toEqual({
      x: 0.1,
      y: 0.1,
      width: 0.5,
      height: 0.5,
    });
  });

  it('cuts what goes past an edge', () => {
    expect(
      fractionBoxOf({ box: { x: -100, y: 0, width: 300, height: 100 }, screen }),
    ).toEqual({
      x: 0,
      y: 0,
      width: 0.2,
      height: 0.2,
    });
  });

  it('says nothing about what is scrolled out of view', () => {
    expect(
      fractionBoxOf({ box: { x: 10, y: 900, width: 100, height: 40 }, screen }),
    ).toBeNull();
  });

  it('says nothing about a box with no size, or a screen with none', () => {
    expect(
      fractionBoxOf({ box: { x: 10, y: 10, width: 0, height: 40 }, screen }),
    ).toBeNull();
    expect(
      fractionBoxOf({
        box: { x: 10, y: 10, width: 5, height: 5 },
        screen: { width: 0, height: 0 },
      }),
    ).toBeNull();
  });
});
