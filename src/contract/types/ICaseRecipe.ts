import type { IStepRecipe } from './IStepRecipe';
import type { TargetKind } from './TargetKind';

/** A case a run walked through, kept to walk it again without the agent; it holds while the case reads the same. */
export interface ICaseRecipe {
  caseId: string;
  fingerprint: string;
  targetKind: TargetKind;
  steps: IStepRecipe[];
  runId: string;
  recordedAt: number;
}
