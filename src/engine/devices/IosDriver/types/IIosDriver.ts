import type { IWindowPlace, ShrinkImage } from '@/engine/devices/types';

/**
 * O idb e o simulador que o QA já tem, o app em teste, e a janela do Simulator quando o
 * QA anda o caso nela; `onClosed` ouve o QA fechá-la.
 */
export interface IIosDriver {
  idb: string;
  udid: string;
  app: string;
  shrink?: ShrinkImage;
  window?: IWindowPlace;
  onClosed?: () => void;
}
