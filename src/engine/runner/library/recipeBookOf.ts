import type { IRecipeBook } from '@/contract';
import type { RunnerJob } from '@/engine/runner/types';
import { RECORDED_STEPS_SCHEMA } from '@/engine/runner/constants';

/**
 * The recordings a job holds for one plan, as a walk reads them; one whose steps do not
 * read as a recording's is left out.
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
