import type { Severity } from './Severity';
import type { StepVerdict } from './StepVerdict';

/** One step a run reported: `screenshot` is inline because the page cannot read disk, `at` is when, in epoch ms, `by` says no agent or a healing one walked it, `sameAs` names a bug already open that failed it again, and `frame` the Figma frame a finding says the screen differs from. */
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
