/**
 * Quantos frames um relógio constante deve ao vídeo até `now`: um no começo, depois um a
 * cada tique.
 */
export function framesDueOf(props: {
  startedAt: number;
  now: number;
  fps: number;
}): number {
  return Math.floor(((props.now - props.startedAt) * props.fps) / 1000) + 1;
}
