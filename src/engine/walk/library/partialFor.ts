import type { ICaseRecipe, IFlatStep, IRecipeBook, TargetKind } from '@/contract';
import { fingerprintOf } from './fingerprintOf';

/**
 * Até onde um caso sem receita já foi gravado: os primeiros passos dele, enquanto ele
 * disser o mesmo no mesmo tipo de alvo.
 */
export function partialFor(props: {
  book: IRecipeBook;
  steps: IFlatStep[];
  targetKind: TargetKind;
}): ICaseRecipe | null {
  const [first] = props.steps;

  if (first === undefined) return null;

  const fingerprint = fingerprintOf({ targetKind: props.targetKind, steps: props.steps });
  const kept = (props.book.partial ?? []).find(
    (one) =>
      one.caseId === first.caseId &&
      one.fingerprint === fingerprint &&
      one.targetKind === props.targetKind,
  );

  return kept !== undefined &&
    kept.steps.length < props.steps.length &&
    kept.steps.every(
      ({ number }, position) => props.steps[position]?.numberInCase === number,
    )
    ? kept
    : null;
}
