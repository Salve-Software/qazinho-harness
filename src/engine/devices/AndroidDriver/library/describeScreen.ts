import type { IScreenNode } from '@/engine/devices/AndroidDriver/types';
import { ANDROID } from '@/engine/devices/AndroidDriver/constants';
import { numberDuplicates } from '@/engine/devices/library';
import { isListedControl } from './isListedControl';

/** O que o agente pode ver: o que uma pessoa leria na tela. */
export function describeScreen(props: { nodes: IScreenNode[]; app: string }): string {
  const text = props.nodes
    .filter((node) => node.text.length > 0)
    .map((node) => node.text)
    .join('\n')
    .slice(0, ANDROID.screenTextLimit);

  const controls = props.nodes
    .filter(isListedControl)
    .slice(0, ANDROID.controlLimit)
    .map(labelOf);

  return [
    `APP: ${props.app}`,
    'TEXT:',
    text,
    'CONTROLS:',
    ...numberDuplicates(controls),
  ].join('\n');
}

function labelOf(node: IScreenNode): string {
  const label = node.text.length > 0 ? node.text : node.desc;

  return `${node.role.toLowerCase()}: ${(label.length > 0 ? label : node.id).slice(0, ANDROID.labelLimit)}`;
}
