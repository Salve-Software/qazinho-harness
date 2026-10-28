import type { RunnerJob } from '@/engine/runner/types';
import type { IVariableValue } from '@/engine/types';

/** As variáveis de CI do projeto como um walk as digita. */
export function valuesOf(variables: RunnerJob['variables']): IVariableValue[] {
  return variables.map(({ name, description, value }) => ({
    name,
    description: description ?? '',
    value,
  }));
}
