import type { ICaseRecipe, IFlatStep, IStepAction, TargetKind } from '@/contract';
import { fingerprintOf } from './fingerprintOf';
import { recipeOf } from './recipeOf';

/**
 * Os passos do começo de um caso que passaram com a prova, como receita do caso inteiro;
 * null quando nenhum passou, ou quando todos passaram e o caso já tem a receita dele.
 */
export function partialRecipeOf(props: {
  steps: IFlatStep[];
  targetKind: TargetKind;
  actions: Map<number, IStepAction[]>;
  proofs: Map<number, string>;
  runId: string;
  at: number;
}): ICaseRecipe | null {
  const stopped = props.steps.findIndex(
    ({ numberInCase }) => (props.proofs.get(numberInCase) ?? '').trim().length === 0,
  );

  if (stopped <= 0) return null;

  const recipe = recipeOf({ ...props, steps: props.steps.slice(0, stopped) });

  return recipe === null
    ? null
    : {
        ...recipe,
        fingerprint: fingerprintOf({ targetKind: props.targetKind, steps: props.steps }),
      };
}
