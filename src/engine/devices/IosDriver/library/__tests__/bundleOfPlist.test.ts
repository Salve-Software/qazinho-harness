import { describe, expect, it } from 'vitest';
import { bundleOfPlist } from '@/engine/devices/IosDriver/library';

describe('bundleOfPlist', () => {
  it('reads the identifier plutil printed', () => {
    expect(bundleOfPlist('com.apple.dt.Xcode\n')).toBe('com.apple.dt.Xcode');
  });

  it('a build with no identifier names none', () => {
    expect(bundleOfPlist('/tmp/App.app/Info.plist: Could not extract value')).toBeNull();
  });

  it('plutil saying nothing names none', () => {
    expect(bundleOfPlist('')).toBeNull();
  });
});
