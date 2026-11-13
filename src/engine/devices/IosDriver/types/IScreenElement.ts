import type { IBox } from '@/engine/devices/types';

/**
 * Um elemento da árvore de acessibilidade, com a caixa em pontos e o ponto em que um dedo
 * pousaria.
 */
export interface IScreenElement {
  label: string;
  role: string;
  x: number;
  y: number;
  box: IBox;
}
