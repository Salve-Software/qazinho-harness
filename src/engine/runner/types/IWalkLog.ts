import type { IRunFinding, IStepOutcome } from '@/contract';

/** What a runner kept of one plan's walk: each step settled, when each began, each bug seen beside one, and when the walk began and ended, in epoch ms. */
export interface IWalkLog {
  outcomes: IStepOutcome[];
  began: Map<number, number>;
  findings: IRunFinding[];
  startedAt: number;
  endedAt: number;
}
