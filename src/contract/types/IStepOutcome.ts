import type { Severity } from './Severity';
import type { StepVerdict } from './StepVerdict';

/**
 * Um passo que uma run relatou, com a tela embutida, o quando, quem o andou, e o bug ou
 * frame para que ele aponta.
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
}
