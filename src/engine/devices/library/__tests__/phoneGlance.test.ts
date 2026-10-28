import type { ShrinkImage } from '@/engine/devices/types';
import { describe, expect, it } from 'vitest';
import { phoneGlance } from '@/engine/devices/library';

function png(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(24);

  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);

  return bytes;
}

/**
 * Um shrink que lembra o que pediram a ele, e responde com uma marca em vez de um JPEG.
 */
function fakeShrink(): { shrink: ShrinkImage; asked: Parameters<ShrinkImage>[0][] } {
  const asked: Parameters<ShrinkImage>[0][] = [];

  return {
    asked,
    shrink: (props) => {
      asked.push(props);

      return Buffer.from('jpeg');
    },
  };
}

describe('phoneGlance', () => {
  it('shrinks a foldable screenshot to the budget, as a JPEG', () => {
    const { shrink, asked } = fakeShrink();
    const glance = phoneGlance({ image: png(1768, 2208), shrink });

    expect(glance).toEqual({
      data: Buffer.from('jpeg').toString('base64'),
      mimeType: 'image/jpeg',
    });
    expect((asked[0]?.width ?? 0) * (asked[0]?.height ?? 0)).toBeLessThanOrEqual(802_000);
    expect(asked[0]?.width).toBeLessThan(1768);
  });

  it('hands the screenshot as it came when there is nothing to shrink with', () => {
    const image = png(1768, 2208);

    expect(phoneGlance({ image, shrink: null })).toEqual({
      data: image.toString('base64'),
      mimeType: 'image/png',
    });
  });

  it('does NOT shrink bytes it cannot read the size of', () => {
    const { shrink, asked } = fakeShrink();

    expect(
      phoneGlance({ image: Buffer.from('not a png at all, really'), shrink }).mimeType,
    ).toBe('image/png');
    expect(asked).toEqual([]);
  });
});
