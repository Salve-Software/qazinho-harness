import type { ICaseRecipe, IRecipeBook, IFlatStep, TargetKind } from '@/contract';
import { fingerprintOf } from './fingerprintOf';

/**
 * A receita com que um caso pode ser andado de novo: uma guardada para este mesmo caso,
 * neste tipo de alvo, com um passo para cada passo dele.
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
