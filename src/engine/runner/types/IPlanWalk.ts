import type { IWalkLog } from './IWalkLog';
import type { RunnerJob } from './RunnerJob';
import type { ICaseRecipe, IFlatStep } from '@/contract';

/**
 * Um plano como um job o andou: o plano, o id da run, os passos, o que o walk guardou, as
 * gravações que fez e por que parou no meio, se parou.
 */
export interface IPlanWalk {
  plan: RunnerJob['plans'][number];
  runId: string;
  steps: IFlatStep[];
  log: IWalkLog;
  recorded: ICaseRecipe[];
  failure: string | null;
}
