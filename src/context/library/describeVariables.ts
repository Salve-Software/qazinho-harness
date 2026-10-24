import type { IVariableBrief } from '@/contract';

/** The variables an agent may type, as the lines that list them under a blank line; none when the project keeps none. */
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
