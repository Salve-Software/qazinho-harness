import type { ICaseRecipe, IFlatStep, IRecipeBook, TargetKind } from '@/contract';
import { recipeFor } from './recipeFor';

/** O preparo gravado de um caso à mão, enquanto as pré-condições dele dizem o mesmo. */
export function prepFor(props: {
  book: IRecipeBook;
  step: IFlatStep;
  targetKind: TargetKind;
}): ICaseRecipe | null {
  return recipeFor({
    book: { cases: props.book.preps ?? [] },
    steps: [props.step],
    targetKind: props.targetKind,
  });
}
