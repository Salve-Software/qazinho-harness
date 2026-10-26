import type { Severity } from './Severity';

/** A bug the runner filed on the side of a step, with the step it was walking, the screen it saw, and when, in epoch ms; `sameAs` names a bug already open it saw again, and `frame` the Figma frame the screen differs from. */
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
