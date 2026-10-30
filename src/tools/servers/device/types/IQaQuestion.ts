import type { IVariableBrief } from '@/contract';

/**
 * Uma pergunta que o agente faz ao QA no meio da run: o que precisa, em que tela, as
 * respostas que oferece, e a variável em que uma resposta secreta fica.
 */
export interface IQaQuestion {
  question: string;
  screen: string | null;
  options: string[];
  secret: IVariableBrief | null;
}
