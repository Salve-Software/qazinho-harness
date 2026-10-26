import { describe, expect, it } from 'vitest';
import { boxOfBounds } from '@/engine/devices/AndroidDriver/library';

describe('boxOfBounds', () => {
  it('reads where a node sits and how big it is, in pixels', () => {
    expect(boxOfBounds('[84,567][504,693]')).toEqual({
      x: 84,
      y: 567,
      width: 420,
      height: 126,
    });
  });

  it('gives nothing for a node with no size, or for bounds it cannot read', () => {
    expect(boxOfBounds('[10,10][10,40]')).toBeNull();
    expect(boxOfBounds('')).toBeNull();
  });
});
