import type { IVariableBrief } from './IVariableBrief';

/**
 * Uma resposta que o QA pode escolher para a pergunta do agente, e o que escolhê-la
 * significa; uma com `variables` abre uma janela para o QA digitar os valores.
 */
export interface IChatQuestionOption {
  label: string;
  description: string;
  variables?: IVariableBrief[];
}
