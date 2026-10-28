import type { Severity } from '@/contract';

/**
 * Um passo que falhou ou um bug visto ao lado de um, como um runner o abre: onde foi
 * pego, o que quebrou, a tela e o quando.
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
