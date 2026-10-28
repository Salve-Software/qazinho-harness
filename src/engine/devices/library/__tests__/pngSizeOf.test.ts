import { describe, expect, it } from 'vitest';
import { pngSizeOf } from '@/engine/devices/library';

/**
 * Os primeiros 24 bytes de um PNG: a assinatura, depois o chunk IHDR com largura e
 * altura.
 */
function header(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(24);

  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
  bytes.writeUInt32BE(13, 8);
  bytes.write('IHDR', 12);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);

  return bytes;
}

describe('pngSizeOf', () => {
  it('reads the size of a phone screenshot from its header', () => {
    expect(pngSizeOf(header(1768, 2208))).toEqual({ width: 1768, height: 2208 });
  });

  it('does NOT read a JPEG as a PNG', () => {
    expect(
      pngSizeOf(Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...Array<number>(20).fill(0)])),
    ).toBeNull();
  });

  it('gives up on bytes too short to hold a header', () => {
    expect(pngSizeOf(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
  });
});
