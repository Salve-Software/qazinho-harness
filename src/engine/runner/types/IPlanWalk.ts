import type { IWalkLog } from './IWalkLog';
import type { RunnerJob } from './RunnerJob';
import type { ICaseRecipe, IFlatStep } from '@/contract';

/** One plan as a job walked it: the plan, its run's id, its steps, what the walk kept, the recordings it made and why it broke off, if it did. */
export interface IPlanWalk {
  plan: RunnerJob['plans'][number];
  runId: string;
  steps: IFlatStep[];
  log: IWalkLog;
  recorded: ICaseRecipe[];
  failure: string | null;
}
