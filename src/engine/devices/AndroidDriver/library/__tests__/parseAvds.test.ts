import { describe, expect, it } from 'vitest';
import { parseAvds } from '@/engine/devices/AndroidDriver/library';

describe('parseAvds', () => {
  it('lists the emulators the QA already made', () => {
    expect(parseAvds('Pixel_3_API_36\nPixel_7_API_34\n')).toEqual([
      'Pixel_3_API_36',
      'Pixel_7_API_34',
    ]);
  });

  it('drops the notice the tool prints above the list', () => {
    const listed = 'INFO    | Storing crashdata in: /tmp/x\nPixel_3_API_36\n';

    expect(parseAvds(listed)).toEqual(['Pixel_3_API_36']);
  });

  it('a machine with no emulator has none', () => {
    expect(parseAvds('')).toEqual([]);
  });
});
