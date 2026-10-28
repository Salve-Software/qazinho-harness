import type { ICaseRecipe, IFlatStep, IStepAction, TargetKind } from '@/contract';
import { fingerprintOf } from './fingerprintOf';

/**
 * Um caso que uma run andou, como receita: o que cada passo fez e as palavras que o
 * provaram; null quando um passo não deixou prova a conferir.
 */
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
