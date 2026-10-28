import type { CaseTurnEnd } from './CaseTurnEnd';
import type { ICaseTurn } from './ICaseTurn';

/**
 * O agente a que um walk entrega cada caso, seja qual for o caminho até o modelo: age
 * pelas ferramentas do dispositivo até o turno acabar, e um turno pode ser encerrado.
 */
export interface ICaseAgent {
  walk: (turn: ICaseTurn) => Promise<CaseTurnEnd>;
  cancel: (scope: string) => void;
}
