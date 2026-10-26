import { describe, expect, it } from 'vitest';
import { launchArgs } from '@/engine/devices/AndroidDriver/library';

describe('launchArgs', () => {
  /**
   * A foldable or tablet AVD has no physical keys, and monkey aborts on one ("SYS_KEYS has no
   * physical keys") unless told to send none: the app never opened and every run broke at once.
   * adb does not run here, so the test reads the declaration.
   */
  it('sends no system key, so a device without physical keys still opens the app', () => {
    const args = launchArgs('shop.app');

    expect(
      args.slice(args.indexOf('--pct-syskeys'), args.indexOf('--pct-syskeys') + 2),
    ).toEqual(['--pct-syskeys', '0']);
  });

  it("opens the app's launcher activity once, and nothing else", () => {
    expect(launchArgs('shop.app')).toEqual(
      expect.arrayContaining([
        '-p',
        'shop.app',
        '-c',
        'android.intent.category.LAUNCHER',
        '1',
      ]),
    );
    expect(launchArgs('shop.app').at(-1)).toBe('1');
  });
});
