import type { ICaseRecipe } from './ICaseRecipe';

/** Every case of a workspace that can be walked again without the agent. */
export interface IRecipeBook {
  cases: ICaseRecipe[];
}
