import { describe, expect, it } from 'vitest';
import { bootArgs } from '@/engine/devices/AndroidDriver/library';

describe('bootArgs', () => {
  /**
   * O emulador abria uma janela própria por cima do QAzinho em toda run, embora o painel
   * do dispositivo já mostre a tela dele. O emulador não roda aqui, então o teste lê as
   * flags.
   */
  it('boots the emulator with no window of its own', () => {
    expect(bootArgs('Pixel_8')).toContain('-no-window');
  });

  it("boots the QA's AVD, with no boot animation and no sound", () => {
    expect(bootArgs('Pixel_8')).toEqual([
      '-avd',
      'Pixel_8',
      '-no-window',
      '-no-boot-anim',
      '-no-audio',
    ]);
  });
});
