import type { IVariableBrief } from '@/contract';

/**
 * Uma pergunta que o agente faz ao QA no meio da run: o que ele precisa, as respostas que
 * oferece, e a variável em que uma resposta secreta fica guardada.
 */
export interface IQaQuestion {
  question: string;
  options: string[];
  secret: IVariableBrief | null;
}
