import type { IBox } from '@/engine/devices/types';

/** uiautomator writes a box as `[left,top][right,bottom]`, in the screen's pixels; null for a box with no size. */
export function boxOfBounds(bounds: string): IBox | null {
  const read = /\[(-?\d+),(-?\d+)\]\[(-?\d+),(-?\d+)\]/.exec(bounds);

  if (!read) return null;

  const [left, top, right, bottom] = read.slice(1).map(Number) as [
    number,
    number,
    number,
    number,
  ];

  return right <= left || bottom <= top
    ? null
    : { x: left, y: top, width: right - left, height: bottom - top };
}
