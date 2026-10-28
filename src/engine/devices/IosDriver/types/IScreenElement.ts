import type { IBox } from '@/engine/devices/types';

/**
 * Um elemento da árvore de acessibilidade, com a caixa em pontos, o ponto em que um dedo
 * pousaria, e se é o ícone de um app na tela inicial.
 */
export interface IScreenElement {
  label: string;
  role: string;
  x: number;
  y: number;
  box: IBox;
  isLaunchIcon: boolean;
}
