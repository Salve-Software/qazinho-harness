import type { IBox } from '@/engine/devices/types';

/**
 * O uiautomator escreve uma caixa como `[left,top][right,bottom]`, em pixels da tela;
 * null para uma caixa sem tamanho.
 */
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
