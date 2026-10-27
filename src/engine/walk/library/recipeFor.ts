import type { ICaseRecipe, IRecipeBook, IFlatStep, TargetKind } from '@/contract';
import { fingerprintOf } from './fingerprintOf';

/**
 * The recipe a case can be walked again with: one kept for this very case, on this kind
 * of target, with a step for each of its steps.
 */
export function recipeFor(props: {
  book: IRecipeBook;
  steps: IFlatStep[];
  targetKind: TargetKind;
}): ICaseRecipe | null {
  const [first] = props.steps;

  if (first === undefined) return null;

  const fingerprint = fingerprintOf({ targetKind: props.targetKind, steps: props.steps });
  const recipe = props.book.cases.find(
    (one) =>
      one.caseId === first.caseId &&
      one.fingerprint === fingerprint &&
      one.targetKind === props.targetKind,
  );

  return recipe !== undefined &&
    props.steps.every(({ numberInCase }) =>
      recipe.steps.some(({ number }) => number === numberInCase),
    )
    ? recipe
    : null;
}
