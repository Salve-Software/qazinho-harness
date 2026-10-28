import { describe, expect, it } from 'vitest';
import { launchArgs } from '@/engine/devices/AndroidDriver/library';

describe('launchArgs', () => {
  /**
   * Um AVD dobrável ou tablet não tem teclas físicas, e o monkey aborta num desses
   * ("SYS_KEYS has no physical keys") a menos que mandem não enviar nenhuma: o app nunca
   * abria e toda run quebrava na hora. O adb não roda aqui, então o teste lê a
   * declaração.
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
