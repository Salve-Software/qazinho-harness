/** O pixel de uma tela desse tamanho em que uma fração dela cai, sem sair da tela. */
export function pointOf(props: {
  x: number;
  y: number;
  size: { width: number; height: number };
}): { x: number; y: number } {
  const { x, y, size } = props;

  return { x: inside(x, size.width), y: inside(y, size.height) };
}

function inside(fraction: number, length: number): number {
  const pixel = Math.round((Number.isFinite(fraction) ? fraction : 0) * length);

  return Math.min(Math.max(pixel, 0), Math.max(length - 1, 0));
}
