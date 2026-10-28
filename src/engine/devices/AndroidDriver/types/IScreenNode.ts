import type { IBox } from '@/engine/devices/types';

/**
 * Um nó da tela como o uiautomator o viu, com a caixa em pixels e o ponto em que um dedo
 * pousaria.
 */
export interface IScreenNode {
  text: string;
  desc: string;
  id: string;
  role: string;
  isClickable: boolean;
  isEditable: boolean;
  x: number;
  y: number;
  box: IBox;
}
