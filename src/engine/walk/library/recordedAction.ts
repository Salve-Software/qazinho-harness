import type { IStepAction } from '@/contract';
import type { IVariableValue } from '@/engine/types';
import { hiddenValues } from './hiddenValues';

/**
 * The action a recipe keeps, its ${NAME} as the agent wrote it, with how a web run found
 * its targets unless that would keep a variable's value.
 */
export function recordedAction(props: {
  action: IStepAction;
  found: { locator: string; toLocator: string | null; option: string | null } | null;
  values: IVariableValue[];
}): IStepAction {
  const { action, found, values } = props;

  if (found === null) return action;

  const said = [found.locator, found.toLocator ?? '', found.option ?? ''].join('\n');

  if (hiddenValues({ text: said, values }) !== said) return action;

  return {
    ...action,
    locator: found.locator,
    ...(found.toLocator === null ? {} : { toLocator: found.toLocator }),
    ...(found.option === null ? {} : { option: found.option }),
  };
}
