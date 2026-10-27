import type { IStepAction } from '@/contract';
import type { IVariableValue } from '@/engine/types';

const PLACEHOLDER = /\$\{([A-Z][A-Z0-9_]*)\}/g;

/**
 * The action as the device carries it out: each ${NAME} in it turned into that variable's
 * value, and a name the project does not keep refused.
 */
export function resolvedAction(props: {
  action: IStepAction;
  values: IVariableValue[];
}): IStepAction {
  const { action, values } = props;

  return {
    ...action,
    target: filled({ text: action.target, values }),
    value: filled({ text: action.value, values }),
    ...(action.promptText === undefined
      ? {}
      : { promptText: filled({ text: action.promptText, values }) }),
  };
}

function filled(props: { text: string; values: IVariableValue[] }): string {
  const { values } = props;

  return props.text.replace(PLACEHOLDER, (_whole, name: string) => {
    const found = values.find((one) => one.name === name);

    if (found !== undefined) return found.value;

    throw new Error(
      values.length === 0
        ? `The project keeps no variables, so there is no \${${name}} to type.`
        : `The project keeps no variable called \${${name}}. It keeps ${values.map((one) => `\${${one.name}}`).join(', ')}.`,
    );
  });
}
