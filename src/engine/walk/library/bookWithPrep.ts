import type { ICaseRecipe, IRecipeBook } from '@/contract';

/** O livro com o preparo novo de um caso à mão, no lugar do que ele tinha. */
export function bookWithPrep(props: {
  book: IRecipeBook;
  prep: ICaseRecipe;
}): IRecipeBook {
  return {
    ...props.book,
    preps: [
      ...(props.book.preps ?? []).filter(({ caseId }) => caseId !== props.prep.caseId),
      props.prep,
    ],
  };
}
