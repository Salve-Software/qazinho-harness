import type { IVariableBrief } from '@/contract';

/**
 * As variáveis que um agente pode digitar, como as linhas que as listam sob uma linha em
 * branco; nada quando o projeto não guarda nenhuma.
 */
export function describeVariables(variables: IVariableBrief[]): string[] {
  return variables.length === 0
    ? []
    : [
        '',
        'Variables the project keeps, to type as written:',
        ...variables.map(({ name, description }) =>
          description.length === 0 ? `- \${${name}}` : `- \${${name}}: ${description}`,
        ),
      ];
}
