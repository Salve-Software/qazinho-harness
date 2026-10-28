import type { Severity } from '@/contract';

/**
 * Um bug visto ao andar um passo que o passo não pergunta; `sameAs` nomeia um bug aberto.
 */
export interface IStepFinding {
  title: string;
  severity: Severity;
  expected: string;
  got: string;
  sameAs?: string;
  frame?: string;
}
