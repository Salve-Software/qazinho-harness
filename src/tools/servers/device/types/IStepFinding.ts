import type { Severity } from '@/contract';

/**
 * A bug seen while walking a step that the step does not ask about; `sameAs` names an
 * open bug.
 */
export interface IStepFinding {
  title: string;
  severity: Severity;
  expected: string;
  got: string;
  sameAs?: string;
  frame?: string;
}
