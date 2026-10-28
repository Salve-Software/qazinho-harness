import type { IHarnessSection } from '@/context/types';
import type { IVariableBrief } from '@/contract';

/**
 * As variáveis que o projeto guarda, pelo nome e pelo que cada uma guarda, como uma seção
 * com que o chat planeja; nunca um valor.
 */
export function describeKeptVariables(variables: IVariableBrief[]): IHarnessSection {
  return {
    title: "The project's variables",
    lines:
      variables.length === 0
        ? ['The project keeps no variables yet.']
        : [
            'The project keeps these. A step names one as ${NAME}, and no one reads a value back:',
            ...variables.map(({ name, description }) =>
              description.length === 0
                ? `- \${${name}}`
                : `- \${${name}}: ${description}`,
            ),
          ],
  };
}
