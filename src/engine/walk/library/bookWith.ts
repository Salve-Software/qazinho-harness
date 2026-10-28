import type { ICaseRecipe, IRecipeBook } from '@/contract';

/** O livro com as receitas novas, cada uma no lugar da que o caso dela tinha. */
export function bookWith(props: {
  book: IRecipeBook;
  recipes: ICaseRecipe[];
}): IRecipeBook {
  const fresh = new Set(props.recipes.map(({ caseId }) => caseId));

  return {
    cases: [
      ...props.book.cases.filter(({ caseId }) => !fresh.has(caseId)),
      ...props.recipes,
    ],
  };
}
