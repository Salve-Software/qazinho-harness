import type { IAppRunBrief } from './IAppRunBrief';
import type { TargetKind } from './TargetKind';

/** A workspace at a glance: the target it tests on, how big its plan is, its latest run, what it is busy with, and how many questions its chat waits on the QA for, and the Figma design it is checked against. */
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
