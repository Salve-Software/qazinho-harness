import type { Severity } from './Severity';
import type { StepVerdict } from './StepVerdict';
import type { UnwalkedReason } from './UnwalkedReason';

/**
 * Um passo que uma run relatou: a tela, o quando, quem o andou, o bug ou frame para que
 * aponta, e por que não rodou.
 */
export interface IStepOutcome {
  workspaceId: string;
  caseId: string;
  stepNumber: number;
  index: number;
  action: string;
  expected: string;
  verdict: StepVerdict;
  why: string;
  got: string;
  title: string;
  severity: Severity;
  tookMs: number;
  at: number;
  screenshot: string | null;
  shotFile: string | null;
  by?: 'replay' | 'healed';
  sameAs?: string;
  frame?: string;
  unwalked?: UnwalkedReason;
}
