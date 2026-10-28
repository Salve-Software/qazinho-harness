import type { IVariableValue } from '@/engine/types';
import { RUN_WALK } from '@/engine/walk/constants';

/**
 * O texto com o valor de cada variável que aparece nele lido de volta como o seu ${NAME},
 * o mais longo primeiro; um valor curto demais para distinguir de uma palavra comum fica.
 */
export function hiddenValues(props: { text: string; values: IVariableValue[] }): string {
  return props.values
    .filter(({ value }) => value.length >= RUN_WALK.hiddenFromLength)
    .sort((one, other) => other.value.length - one.value.length)
    .reduce((text, { name, value }) => text.split(value).join(`\${${name}}`), props.text);
}
