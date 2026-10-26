import { describe, expect, it } from 'vitest';
import { needsReinstall } from '@/engine/devices/AndroidDriver/library';

describe('needsReinstall', () => {
  it('replaces an app signed by another key, the way a build from another machine is', () => {
    expect(
      needsReinstall(
        'adb: failed to install /tmp/app.apk: Failure [INSTALL_FAILED_UPDATE_INCOMPATIBLE: Existing package shop.app signatures do not match newer version; ignoring!]',
      ),
    ).toBe(true);
  });

  it('lets an older build in over a newer one already installed', () => {
    expect(needsReinstall('Failure [INSTALL_FAILED_VERSION_DOWNGRADE]')).toBe(true);
  });

  it('does NOT remove the app for a failure removing it would not fix', () => {
    expect(needsReinstall('Failure [INSTALL_FAILED_INSUFFICIENT_STORAGE]')).toBe(false);
    expect(needsReinstall('adb: device offline')).toBe(false);
  });
});
