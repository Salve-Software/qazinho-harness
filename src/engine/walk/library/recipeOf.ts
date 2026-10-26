import type { ICaseRecipe, IFlatStep, IStepAction, TargetKind } from '@/contract';
import { fingerprintOf } from './fingerprintOf';

/** A case a run walked through, as a recipe: what each step did and the words that proved it; null when a step left no proof to check. */
export function recipeOf(props: {
  steps: IFlatStep[];
  targetKind: TargetKind;
  actions: Map<number, IStepAction[]>;
  proofs: Map<number, string>;
  runId: string;
  at: number;
}): ICaseRecipe | null {
  const [first] = props.steps;

  if (first === undefined) return null;

  const steps = props.steps.map(({ numberInCase }) => ({
    number: numberInCase,
    actions: props.actions.get(numberInCase) ?? [],
    proof: props.proofs.get(numberInCase) ?? '',
  }));

  if (steps.some(({ proof }) => proof.trim().length === 0)) return null;

  return {
    caseId: first.caseId,
    fingerprint: fingerprintOf({ targetKind: props.targetKind, steps: props.steps }),
    targetKind: props.targetKind,
    steps,
    runId: props.runId,
    recordedAt: props.at,
  };
}
