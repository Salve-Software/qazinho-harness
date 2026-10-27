import type { IBox } from '@/engine/devices/types';

/**
 * One node of the screen as uiautomator saw it, with its box in pixels and the point a
 * finger would land on.
 */
export interface IScreenNode {
  text: string;
  desc: string;
  id: string;
  role: string;
  isClickable: boolean;
  isEditable: boolean;
  x: number;
  y: number;
  box: IBox;
}
