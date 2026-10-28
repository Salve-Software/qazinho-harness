import type { Severity } from '@/contract';

/**
 * Um passo que o agente julgou pelo `report`, com as palavras que provam que passou e o
 * bug que o reprovou.
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
