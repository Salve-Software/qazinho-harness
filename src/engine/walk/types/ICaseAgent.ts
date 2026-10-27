import type { CaseTurnEnd } from './CaseTurnEnd';
import type { ICaseTurn } from './ICaseTurn';

/**
 * The agent a walk hands each case to, whatever reaches the model: it acts through the
 * device tools until its turn ends, and a turn under way can be ended.
 */
export interface ICaseAgent {
  walk: (turn: ICaseTurn) => Promise<CaseTurnEnd>;
  cancel: (scope: string) => void;
}
