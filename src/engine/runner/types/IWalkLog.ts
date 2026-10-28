import type { IRunFinding, IStepOutcome } from '@/contract';

/**
 * O que um runner guardou do walk de um plano: cada passo resolvido e quando começou,
 * cada bug visto ao lado de um, e o início e o fim do walk, em ms de epoch.
 */
export interface IWalkLog {
  outcomes: IStepOutcome[];
  began: Map<number, number>;
  findings: IRunFinding[];
  startedAt: number;
  endedAt: number;
}
