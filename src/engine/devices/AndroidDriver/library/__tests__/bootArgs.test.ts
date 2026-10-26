import { describe, expect, it } from 'vitest';
import { bootArgs } from '@/engine/devices/AndroidDriver/library';

describe('bootArgs', () => {
  /**
   * The emulator opened its own window over QAzinho for every run, though the device panel
   * already shows its screen. The emulator does not run here, so the test reads the flags.
   */
  it('boots the emulator with no window of its own', () => {
    expect(bootArgs('Pixel_8')).toContain('-no-window');
  });

  it("boots the QA's AVD, with no boot animation and no sound", () => {
    expect(bootArgs('Pixel_8')).toEqual([
      '-avd',
      'Pixel_8',
      '-no-window',
      '-no-boot-anim',
      '-no-audio',
    ]);
  });
});
