import type { IChatQuestion } from './IChatQuestion';
import type { IDraftedCase } from './IDraftedCase';
import type { IPlanStrategy } from './IPlanStrategy';

/**
 * Uma resposta do chat que o main já conferiu: a resposta, as perguntas que ela faz ao
 * QA, e um plano quando o QA concordou com um.
 */
export interface IChatAnswer {
  reply: string;
  questions: IChatQuestion[];
  plan: {
    summary: string;
    cases: IDraftedCase[];
    strategy?: IPlanStrategy | undefined;
  } | null;
}
