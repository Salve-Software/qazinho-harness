import { describe, expect, it } from 'vitest';
import { bootArgs } from '@/engine/devices/AndroidDriver/library';

describe('bootArgs', () => {
  /**
   * O emulador abria uma janela própria por cima do QAzinho em toda run, embora o painel
   * do dispositivo já mostre a tela dele. O emulador não roda aqui, então o teste lê as
   * flags.
   */
  it('boots the emulator with no window of its own', () => {
    expect(bootArgs({ avd: 'Pixel_8', isWindowed: false })).toContain('-no-window');
  });

  it("boots the QA's AVD, with no boot animation and no sound", () => {
    expect(bootArgs({ avd: 'Pixel_8', isWindowed: false })).toEqual([
      '-avd',
      'Pixel_8',
      '-no-window',
      '-no-boot-anim',
      '-no-audio',
    ]);
  });

  /** Num caso à mão o QA usa o próprio emulador, com a janela dele. */
  it('keeps the window of the emulator the QA walks a case by hand on', () => {
    expect(bootArgs({ avd: 'Pixel_8', isWindowed: true })).toEqual([
      '-avd',
      'Pixel_8',
      '-no-boot-anim',
      '-no-audio',
    ]);
  });
});
