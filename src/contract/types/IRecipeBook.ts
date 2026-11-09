import type { ICaseRecipe } from './ICaseRecipe';

/**
 * Os casos de um workspace que andam de novo sem o agente, e em `partial` os que andam
 * só até o passo em que pararam, que ficam nesta máquina.
 */
export interface IRecipeBook {
  cases: ICaseRecipe[];
  partial?: ICaseRecipe[];
}
