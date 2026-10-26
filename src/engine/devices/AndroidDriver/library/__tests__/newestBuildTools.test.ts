import { describe, expect, it } from 'vitest';
import { newestBuildTools } from '@/engine/devices/AndroidDriver/library';

describe('newestBuildTools', () => {
  it('takes the newest, not the last one the folder happened to list', () => {
    expect(newestBuildTools(['34.0.0', '37.0.0', '35.0.0'])).toBe('37.0.0');
  });

  it('compares each part as a number, so 9 is older than 10', () => {
    expect(newestBuildTools(['9.0.0', '10.0.0'])).toBe('10.0.0');
  });

  it('ignores a folder that is not a version', () => {
    expect(newestBuildTools(['.DS_Store', 'source.properties', '34.0.0'])).toBe('34.0.0');
  });

  it('an SDK with no build-tools names none', () => {
    expect(newestBuildTools([])).toBeNull();
  });
});
