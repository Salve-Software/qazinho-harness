import type { Severity } from '@/contract';

/**
 * A failed step or a bug seen beside one, as a runner files it: where it was caught, what
 * broke, its screen and when.
 */
export interface ICatch {
  index: number;
  caseId: string;
  stepNumber: number;
  action: string;
  title: string;
  severity: Severity;
  why: string;
  expected: string;
  got: string;
  shotFile: string | null;
  at: number;
  sameAs: string | undefined;
  isIncidental: boolean;
}
