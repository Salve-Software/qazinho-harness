import type { IVariableBrief } from '@/contract';

/**
 * A question the agent asks the QA mid-run: what it needs, the answers it offers, and the
 * variable a secret answer is kept as.
 */
export interface IQaQuestion {
  question: string;
  options: string[];
  secret: IVariableBrief | null;
}
