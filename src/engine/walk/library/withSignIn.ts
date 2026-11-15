import type { ICaseRecipe, ISignInRecipe } from '@/contract';

/**
 * A gravação de um caso que começou logado, com o jeito de entrar na conta no primeiro
 * passo, para quem a anda depois entrar sem o agente.
 */
export function withSignIn(props: {
  recipe: ICaseRecipe;
  signIn: ISignInRecipe | null;
}): ICaseRecipe {
  const { recipe, signIn } = props;
  const [first, ...rest] = recipe.steps;

  if (signIn === null || first === undefined) return recipe;

  return { ...recipe, steps: [{ ...first, signIn }, ...rest] };
}
