import type { IScreenElement } from '@/engine/devices/IosDriver/types';
import { IOS } from '@/engine/devices/IosDriver/constants';
import { numberDuplicates } from '@/engine/devices/library';

/**
 * O que o agente pode ver: o que uma pessoa leria na tela, e a tela inicial dita como tal
 * quando o app não está aberto.
 */
export function describeIosScreen(props: {
  elements: IScreenElement[];
  app: string;
  isHome: boolean;
}): string {
  const labelled = props.elements.filter((one) => one.label.length > 0);

  const text = labelled
    .map((one) => one.label)
    .join('\n')
    .slice(0, IOS.screenTextLimit);

  const controls = labelled
    .slice(0, IOS.controlLimit)
    .map((one) => `${one.role.toLowerCase()}: ${one.label.slice(0, IOS.labelLimit)}`);

  return [
    props.isHome ? `APP: the home screen, ${props.app} is not open` : `APP: ${props.app}`,
    'TEXT:',
    text,
    'CONTROLS:',
    ...numberDuplicates(controls),
  ].join('\n');
}
