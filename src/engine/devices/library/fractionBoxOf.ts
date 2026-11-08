import type { IScreenBox } from '@/contract';
import type { IBox } from '@/engine/devices/types';

/**
 * Onde uma coisa está em frações da tela, cortada nas bordas dela; nada quando o meio
 * dela não está à vista.
 */
export function fractionBoxOf(props: {
  box: IBox;
  screen: { width: number; height: number };
}): IScreenBox | null {
  const { box, screen } = props;

  if (box.width <= 0 || box.height <= 0 || screen.width <= 0 || screen.height <= 0)
    return null;

  const middleX = box.x + box.width / 2;
  const middleY = box.y + box.height / 2;

  if (middleX < 0 || middleY < 0 || middleX > screen.width || middleY > screen.height)
    return null;

  const left = Math.max(box.x, 0);
  const top = Math.max(box.y, 0);
  const right = Math.min(box.x + box.width, screen.width);
  const bottom = Math.min(box.y + box.height, screen.height);

  return {
    x: left / screen.width,
    y: top / screen.height,
    width: (right - left) / screen.width,
    height: (bottom - top) / screen.height,
  };
}
