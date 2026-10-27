import type { IScreenElement } from '@/engine/devices/IosDriver/types';
import { ordinalOf, withoutRole } from '@/engine/devices/library';

/**
 * The agent names what a person would read, the label, "#2" for the second of several,
 * and a control copied as look lists it.
 */
export function findElement(props: {
  elements: IScreenElement[];
  target: string;
}): IScreenElement | null {
  const listed = withoutRole(props.target);

  return find(props) ?? (listed === null ? null : find({ ...props, target: listed }));
}

function find(props: {
  elements: IScreenElement[];
  target: string;
}): IScreenElement | null {
  const { name, nth } = ordinalOf(props.target);
  const wanted = name.toLowerCase();

  if (wanted.length === 0) return null;

  const labelled = props.elements.filter((one) => one.label.length > 0);

  return (
    labelled.filter((one) => one.label.toLowerCase() === wanted)[nth] ??
    labelled.filter((one) => one.label.toLowerCase().includes(wanted))[nth] ??
    null
  );
}
