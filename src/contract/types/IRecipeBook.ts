import type { ICaseRecipe } from './ICaseRecipe';

/** Todo caso de um workspace que pode ser andado de novo sem o agente. */
export interface IRecipeBook {
  cases: ICaseRecipe[];
}
