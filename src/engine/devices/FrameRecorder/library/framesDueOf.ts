/**
 * How many frames a steady clock owes the video by `now`: one at the start, then one each
 * tick.
 */
export function framesDueOf(props: {
  startedAt: number;
  now: number;
  fps: number;
}): number {
  return Math.floor(((props.now - props.startedAt) * props.fps) / 1000) + 1;
}
