import type { Severity } from '@/contract';

/**
 * A step the agent judged through `report`, with the words that prove a pass and the bug
 * that failed it.
 */
export interface IStepReport {
  step: number;
  verdict: 'passed' | 'failed' | 'blocked';
  why: string;
  got: string;
  title: string;
  severity: Severity;
  note: string;
  proof: string;
  sameAs?: string;
  frame?: string;
}
