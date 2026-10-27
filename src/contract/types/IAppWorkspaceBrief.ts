import type { IAppRunBrief } from './IAppRunBrief';
import type { TargetKind } from './TargetKind';

/**
 * A workspace at a glance: its target, plan size, latest run, what it is busy with and
 * the questions waiting.
 */
export interface IAppWorkspaceBrief {
  id: string;
  name: string;
  projectId: string;
  target: TargetKind | null;
  cases: number;
  steps: number;
  runs: number;
  bugs: number;
  latestRun: IAppRunBrief | null;
  isRunning: boolean;
  isAnswering: boolean;
  openQuestions: number;
  design: string | null;
}
