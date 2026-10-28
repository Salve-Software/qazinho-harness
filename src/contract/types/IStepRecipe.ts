import type { IStepAction } from './IStepAction';

/**
 * Um passo de um caso como uma run que passou o andou: o que foi feito no dispositivo, e
 * as palavras na tela que provaram que valeu.
 */
export interface IStepRecipe {
  number: number;
  actions: IStepAction[];
  proof: string;
}
