import { describe, expect, it } from 'vitest';
import { frontPackage } from '@/engine/devices/AndroidDriver/library';

/** Uma linha real do `adb shell dumpsys window` num Pixel 3. */
const DUMPED =
  '  mCurrentFocus=Window{9fba570 u0 com.android.settings/com.android.settings.homepage.SettingsHomepageActivity}';

describe('frontPackage', () => {
  it('names the app the QA is looking at', () => {
    expect(frontPackage(DUMPED)).toBe('com.android.settings');
  });

  it('a phone with no window in focus names nothing', () => {
    expect(frontPackage('  mCurrentFocus=null')).toBe('');
  });

  it('a dump that is not a dump names nothing', () => {
    expect(frontPackage('')).toBe('');
  });
});
