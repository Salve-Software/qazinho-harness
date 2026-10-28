import type { IStepRecipe } from './IStepRecipe';
import type { TargetKind } from './TargetKind';

/**
 * Um caso que uma run andou, guardado para andá-lo de novo sem o agente; vale enquanto o
 * caso continuar dizendo o mesmo.
 */
export interface ICaseRecipe {
  caseId: string;
  fingerprint: string;
  targetKind: TargetKind;
  steps: IStepRecipe[];
  runId: string;
  recordedAt: number;
}
