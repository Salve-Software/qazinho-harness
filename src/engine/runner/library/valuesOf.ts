import type { RunnerJob } from '@/engine/runner/types';
import type { IVariableValue } from '@/engine/types';

/** The project's CI variables as a walk types them. */
export function valuesOf(variables: RunnerJob['variables']): IVariableValue[] {
  return variables.map(({ name, description, value }) => ({
    name,
    description: description ?? '',
    value,
  }));
}
