import type { IRecipeBook, ISignInRecipe } from '@/contract';

/**
 * Como a gravação mais nova de um caso web entrou numa conta, para a run entrar de novo
 * sem o agente; null quando nenhuma entrou nela.
 */
export function signInFor(props: {
  book: IRecipeBook;
  account: string;
}): ISignInRecipe | null {
  const recipes = [...props.book.cases, ...(props.book.partial ?? [])]
    .filter((recipe) => recipe.targetKind === 'web')
    .sort((a, b) => b.recordedAt - a.recordedAt);

  for (const recipe of recipes) {
    const signIn = recipe.steps[0]?.signIn;

    if (signIn?.account === props.account && signIn.proof.trim().length > 0)
      return signIn;
  }

  return null;
}
