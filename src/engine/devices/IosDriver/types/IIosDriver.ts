import type { ShrinkImage } from '@/engine/devices/types';

/**
 * O AXe e o simulador que o QA já tem, o app em teste, e como reduzir o que o agente vê.
 */
export interface IIosDriver {
  axe: string;
  udid: string;
  app: string;
  shrink?: ShrinkImage;
}
