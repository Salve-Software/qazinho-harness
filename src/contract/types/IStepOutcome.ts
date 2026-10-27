import type { Severity } from './Severity';
import type { StepVerdict } from './StepVerdict';

/**
 * One step a run reported, with its inline screen, when, who walked it, and the bug or
 * frame it points to.
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
