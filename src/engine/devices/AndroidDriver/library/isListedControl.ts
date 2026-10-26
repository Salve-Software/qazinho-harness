import type { IScreenNode } from '@/engine/devices/AndroidDriver/types';

/** Whether look lists the node under CONTROLS: something a person can read and touch, type in, or that describes itself. */
export function isListedControl(node: IScreenNode): boolean {
  const isReadable = node.text.length > 0 || node.desc.length > 0 || node.isEditable;

  return isReadable && (node.isClickable || node.isEditable || node.desc.length > 0);
}
