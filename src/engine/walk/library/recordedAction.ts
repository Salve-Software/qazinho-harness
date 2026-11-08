import type { IStepAction } from '@/contract';
import type { IVariableValue } from '@/engine/types';
import { hiddenValues } from './hiddenValues';
import { relativeGoto } from './relativeGoto';

/**
 * A ação que uma receita guarda, com o ${NAME} como o agente escreveu, e como uma run web
 * achou os alvos, a menos que isso guardasse o valor de uma variável.
 */
export function recordedAction(props: {
  action: IStepAction;
  found: { locator: string; toLocator: string | null; option: string | null } | null;
  values: IVariableValue[];
  appUrl?: string;
}): IStepAction {
  const { found, values, appUrl } = props;
  const action =
    props.action.kind === 'goto' && appUrl !== undefined
      ? { ...props.action, target: relativeGoto({ target: props.action.target, appUrl }) }
      : props.action;

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
