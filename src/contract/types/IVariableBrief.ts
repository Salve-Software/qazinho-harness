/**
 * Uma variável de um projeto como a página e os agentes a conhecem: o nome, o que ela
 * guarda e se é um segredo, nunca o valor.
 */
export interface IVariableBrief {
  name: string;
  description: string;
  isSecret?: boolean;
}
