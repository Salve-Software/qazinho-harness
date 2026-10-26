import type { ICaseRecipe, IRecipeBook } from '@/contract';

/** The book with new recipes in, each one taking the place of the one its case had. */
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
