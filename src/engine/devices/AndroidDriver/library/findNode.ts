import type { IScreenNode } from '@/engine/devices/AndroidDriver/types';
import { ordinalOf, withoutRole } from '@/engine/devices/library';
import { isListedControl } from './isListedControl';

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

/** The agent names what a person would read, a control before text that reads the same, "#2" for the second look listed, and a control copied as look lists it. */
export function findNode(props: {
  nodes: IScreenNode[];
  target: string;
}): IScreenNode | null {
  const listed = withoutRole(props.target);

  return find(props) ?? (listed === null ? null : find({ ...props, target: listed }));
}
