import type { ISignInRecipe } from './ISignInRecipe';
import type { IStepAction } from './IStepAction';

/**
 * Um passo de um caso como uma run que passou o andou: o que foi feito no dispositivo, as
 * palavras que provaram que valeu e, no primeiro, como a run entrou na conta do caso.
 */
export interface IStepRecipe {
  number: number;
  actions: IStepAction[];
  proof: string;
  signIn?: ISignInRecipe;
}
