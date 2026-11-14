import type { ICaseRecipe } from './ICaseRecipe';

/**
 * Os casos de um workspace que andam de novo sem o agente; `partial`, até onde pararam, e
 * `preps`, o preparo de um caso à mão, ficam nesta máquina.
 */
export interface IRecipeBook {
  cases: ICaseRecipe[];
  partial?: ICaseRecipe[];
  preps?: ICaseRecipe[];
}
