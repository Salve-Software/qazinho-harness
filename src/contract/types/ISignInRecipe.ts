import type { IStepAction } from './IStepAction';

/**
 * Como uma run entrou numa conta: o que fez na tela de entrada e as palavras na tela que
 * mostraram que entrou.
 */
export interface ISignInRecipe {
  account: string;
  actions: IStepAction[];
  proof: string;
}
