import { describe, expect, it } from 'vitest';
import { screenSizeOf } from '@/engine/devices/AndroidDriver/library';

describe('screenSizeOf', () => {
  it("reads the emulator's physical size", () => {
    expect(screenSizeOf('Physical size: 1768x2208\n')).toEqual({
      width: 1768,
      height: 2208,
    });
  });

  it('takes an override the QA set over the physical size, since that is what shows', () => {
    expect(screenSizeOf('Physical size: 1080x2400\nOverride size: 720x1600\n')).toEqual({
      width: 720,
      height: 1600,
    });
  });

  it('has no size to give when adb printed none', () => {
    expect(screenSizeOf('error: no devices/emulators found')).toBeNull();
  });
});
