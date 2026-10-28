import type { IScreenNode } from '@/engine/devices/AndroidDriver/types';
import { ordinalOf, withoutRole } from '@/engine/devices/library';
import { isListedControl } from './isListedControl';

/**
 * O agente nomeia o que uma pessoa leria, um controle antes de um texto igual, "#2" para
 * o segundo que o look lista, e um controle copiado como o look o lista.
 */
export function findNode(props: {
  nodes: IScreenNode[];
  target: string;
}): IScreenNode | null {
  const listed = withoutRole(props.target);

  return find(props) ?? (listed === null ? null : find({ ...props, target: listed }));
}

function says(node: IScreenNode): string[] {
  return [node.text, node.desc, node.id].filter((one) => one.length > 0);
}

function find(props: { nodes: IScreenNode[]; target: string }): IScreenNode | null {
  const { name, nth } = ordinalOf(props.target);
  const wanted = name.toLowerCase();

  if (wanted.length === 0) return null;

  const exact = props.nodes.filter((node) =>
    says(node).some((one) => one.toLowerCase() === wanted),
  );
  const partial = props.nodes.filter((node) =>
    says(node).some((one) => one.toLowerCase().includes(wanted)),
  );

  return (
    exact.filter(isListedControl)[nth] ??
    exact[nth] ??
    partial.filter(isListedControl)[nth] ??
    partial[nth] ??
    null
  );
}
