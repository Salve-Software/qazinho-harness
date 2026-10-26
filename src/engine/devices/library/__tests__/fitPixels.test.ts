import { describe, expect, it } from 'vitest';
import { fitPixels } from '@/engine/devices/library';

describe('fitPixels', () => {
  it('scales a big screenshot down to the budget, keeping its shape', () => {
    const fitted = fitPixels({ width: 1768, height: 2208, maxPixels: 800_000 });

    expect(fitted.width * fitted.height).toBeLessThanOrEqual(801_000);
    expect(fitted.width / fitted.height).toBeCloseTo(1768 / 2208, 2);
  });

  it('does NOT scale up a screenshot already within the budget', () => {
    expect(fitPixels({ width: 600, height: 800, maxPixels: 800_000 })).toEqual({
      width: 600,
      height: 800,
    });
  });

  it('keeps a tall phone tall', () => {
    const fitted = fitPixels({ width: 1179, height: 2556, maxPixels: 800_000 });

    expect(fitted.height).toBeGreaterThan(fitted.width * 2);
  });
});
