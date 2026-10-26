import type { IBox } from '@/engine/devices/types';

/** One element of the accessibility tree, with its box in points, the point a finger would land on, and whether it is an app's icon on the home screen. */
export interface IScreenElement {
  label: string;
  role: string;
  x: number;
  y: number;
  box: IBox;
  isLaunchIcon: boolean;
}
