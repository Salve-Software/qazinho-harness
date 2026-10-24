import type { IChatQuestion } from './IChatQuestion';
import type { IDraftedCase } from './IDraftedCase';

/** A chat answer main already checked: the reply, the questions it puts to the QA, and a plan once they agreed to one. */
export interface IChatAnswer {
  reply: string;
  questions: IChatQuestion[];
  plan: { summary: string; cases: IDraftedCase[] } | null;
}
