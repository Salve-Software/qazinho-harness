import type { IAppRunBrief } from './IAppRunBrief';
import type { TargetKind } from './TargetKind';

/**
 * Um workspace num relance: o alvo, o tamanho do plano, a última run, com o que está
 * ocupado e as perguntas esperando.
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
