import { describe, expect, it } from 'vitest';
import { densityOf } from '@/engine/devices/AndroidDriver/library';

describe('densityOf', () => {
  it('reads the physical density', () => {
    expect(densityOf('Physical density: 420\n')).toBe(420);
  });

  it('takes the override the emulator runs with over the physical one', () => {
    expect(densityOf('Physical density: 420\nOverride density: 480\n')).toBe(480);
  });

  it('falls back to the baseline when the screen says nothing', () => {
    expect(densityOf('')).toBe(160);
  });
});
