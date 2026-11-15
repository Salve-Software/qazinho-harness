import { describe, expect, it } from 'vitest';
import { avdFolderOf } from '@/engine/devices/AndroidDriver/library';

describe('avdFolderOf', () => {
  it('reads where the AVD lives from its .ini', () => {
    expect(
      avdFolderOf(
        'avd.ini.encoding=UTF-8\npath=/Users/ana/.android/avd/Pixel_8.avd\npath.rel=avd/Pixel_8.avd\n',
      ),
    ).toBe('/Users/ana/.android/avd/Pixel_8.avd');
  });

  /** O `path.rel=` também começa com `path`, e não é o caminho inteiro. */
  it('does NOT take the relative path for the folder', () => {
    expect(avdFolderOf('path.rel=avd/Pixel_8.avd\n')).toBeNull();
  });

  it('reads a Windows path as written', () => {
    expect(avdFolderOf('path=C:\\Users\\ana\\.android\\avd\\Pixel_8.avd\r\n')).toBe(
      'C:\\Users\\ana\\.android\\avd\\Pixel_8.avd',
    );
  });
});
