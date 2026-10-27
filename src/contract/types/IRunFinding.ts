import type { Severity } from './Severity';

/**
 * A bug the runner filed beside a step, with its screen and when; `sameAs` names an open
 * bug seen again.
 */
export interface IRunFinding {
  caseId: string;
  stepNumber: number;
  index: number;
  action: string;
  title: string;
  severity: Severity;
  at: number;
  expected: string;
  got: string;
  screenshot: string | null;
  shotFile: string | null;
  sameAs?: string;
  frame?: string;
}
