import type { IRecipeBook } from '@/contract';
import type { RunnerJob } from '@/engine/runner/types';
import { RECORDED_STEPS_SCHEMA } from '@/engine/runner/constants';

/**
 * As gravações que um job guarda para um plano, como um walk as lê; uma cujos passos não
 * batem com os de uma gravação fica de fora.
 */
export function recipeBookOf(props: {
  recordings: RunnerJob['recordings'];
  planId: string;
}): IRecipeBook {
  return {
    cases: props.recordings.flatMap((recording) => {
      const steps = RECORDED_STEPS_SCHEMA.safeParse(recording.steps);

      return recording.planId !== props.planId || !steps.success
        ? []
        : [
            {
              caseId: recording.caseId,
              fingerprint: recording.fingerprint,
              targetKind: recording.targetKind,
              steps: steps.data,
              runId: '',
              recordedAt: Date.parse(recording.recordedAt) || 0,
            },
          ];
    }),
  };
}
