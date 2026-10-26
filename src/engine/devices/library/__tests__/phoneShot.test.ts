import type { ShrinkImage } from '@/engine/devices/types';
import { describe, expect, it } from 'vitest';
import { phoneShot } from '@/engine/devices/library';

function png(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(24);

  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);

  return bytes;
}

/** A shrink that remembers what it was asked, and answers with a marker instead of a JPEG. */
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

describe('phoneShot', () => {
  it('keeps a phone screenshot as a JPEG at its full size, the way the web keeps Chrome', () => {
    const { shrink, asked } = fakeShrink();

    expect(phoneShot({ image: png(1080, 2400), shrink })).toEqual({
      bytes: Buffer.from('jpeg'),
      mimeType: 'image/jpeg',
    });
    expect(asked[0]).toMatchObject({ width: 1080, height: 2400, quality: 70 });
  });

  it('keeps the PNG as it came when there is nothing to make a JPEG with', () => {
    const image = png(1080, 2400);

    expect(phoneShot({ image, shrink: null })).toEqual({
      bytes: image,
      mimeType: 'image/png',
    });
  });

  it('keeps bytes that are not a PNG as they came', () => {
    const { shrink, asked } = fakeShrink();
    const image = Buffer.from('not a png at all, really');

    expect(phoneShot({ image, shrink })).toEqual({ bytes: image, mimeType: 'image/png' });
    expect(asked).toEqual([]);
  });
});
