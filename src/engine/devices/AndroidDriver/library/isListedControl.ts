import type { IScreenNode } from '@/engine/devices/AndroidDriver/types';

/**
 * Se o look lista o nó em CONTROLS: algo que uma pessoa pode ler e tocar, em que pode
 * digitar, ou que se descreve.
 */
export function isListedControl(node: IScreenNode): boolean {
  const isReadable = node.text.length > 0 || node.desc.length > 0 || node.isEditable;

  return isReadable && (node.isClickable || node.isEditable || node.desc.length > 0);
}
