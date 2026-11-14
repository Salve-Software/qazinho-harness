import { describe, expect, it } from 'vitest';
import { phoneFrameOf } from '@/engine/devices/library';

/** Só o cabeçalho de um PNG de 1080 por 2400, que é o que o tamanho lê. */
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from([0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]),
  Buffer.from([0, 0, 0x04, 0x38, 0, 0, 0x09, 0x60]),
]);

describe('a phone screen as a frame of the stream', () => {
  it('is a JPEG with the shape of the screen', () => {
    const frame = phoneFrameOf({ image: PNG, shrink: () => Buffer.from('jpeg') });

    expect(frame?.jpeg.toString()).toBe('jpeg');
    expect(frame?.ratio).toBeCloseTo(0.45);
  });

  it('is nothing when the screen cannot become a JPEG, or is not a PNG', () => {
    expect(phoneFrameOf({ image: PNG, shrink: null })).toBeNull();
    expect(
      phoneFrameOf({ image: Buffer.from('nope'), shrink: () => Buffer.from('x') }),
    ).toBeNull();
  });
});
