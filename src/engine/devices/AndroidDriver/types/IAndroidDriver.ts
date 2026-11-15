import type { IWindowPlace, ShrinkImage } from '@/engine/devices/types';

/**
 * O SDK e o AVD que o QA já tem, o apk em teste, e o lugar da janela do emulador quando
 * o QA anda o caso nela; `onClosed` ouve o QA fechá-la.
 */
export interface IAndroidDriver {
  sdkRoot: string;
  avd: string;
  apk: string;
  shrink?: ShrinkImage;
  window?: IWindowPlace;
  onClosed?: () => void;
}
