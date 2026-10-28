import type { IChatQuestionOption } from './IChatQuestionOption';

/**
 * Uma pergunta que o agente faz ao QA: algumas opções para escolher, e espaço para as
 * palavras do próprio QA.
 */
export interface IChatQuestion {
  header: string;
  question: string;
  options: IChatQuestionOption[];
  isMultiSelect: boolean;
}
