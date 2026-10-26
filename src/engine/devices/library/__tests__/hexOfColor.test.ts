import { describe, expect, it } from 'vitest';
import { hexOfColor } from '@/engine/devices/library';

describe('hexOfColor', () => {
  it('writes a colour the way a design file does', () => {
    expect(hexOfColor('rgb(31, 111, 235)')).toBe('#1F6FEB');
    expect(hexOfColor('rgb(255 255 255)')).toBe('#FFFFFF');
  });

  it('keeps how see-through it is', () => {
    expect(hexOfColor('rgba(0, 0, 0, 0.5)')).toBe('#000000 at 50%');
    expect(hexOfColor('rgb(0 0 0 / 25%)')).toBe('#000000 at 25%');
  });

  it('calls a colour with no opacity transparent', () => {
    expect(hexOfColor('rgba(0, 0, 0, 0)')).toBe('transparent');
  });

  it('leaves a notation it does not know as the browser wrote it', () => {
    expect(hexOfColor(' oklch(0.7 0.1 200) ')).toBe('oklch(0.7 0.1 200)');
  });
});
