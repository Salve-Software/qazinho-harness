import type { Severity } from '@/contract';

/**
 * Um passo que o agente julgou pelo `report`: as palavras que provam que passou, o bug
 * que o reprovou e se o caso segue.
 */
export interface IStepReport {
  step: number;
  verdict: 'passed' | 'failed' | 'blocked';
  why: string;
  got: string;
  title: string;
  severity: Severity;
  goesOn: boolean;
  note: string;
  proof: string;
  sameAs?: string;
  frame?: string;
}
