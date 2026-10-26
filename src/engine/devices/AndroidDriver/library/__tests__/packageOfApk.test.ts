import { describe, expect, it } from 'vitest';
import { packageOfApk } from '@/engine/devices/AndroidDriver/library';

describe('packageOfApk', () => {
  it('reads the package aapt2 printed', () => {
    expect(packageOfApk('com.callstack.expodemo\n')).toBe('com.callstack.expodemo');
  });

  it('a file that is not an apk names no package', () => {
    expect(
      packageOfApk('ERROR: dump failed because no AndroidManifest.xml found'),
    ).toBeNull();
  });

  it('aapt2 saying nothing names no package', () => {
    expect(packageOfApk('')).toBeNull();
  });
});
