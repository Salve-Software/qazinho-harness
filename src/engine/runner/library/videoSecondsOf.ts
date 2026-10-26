/** Where a moment, in epoch ms, sits on a video that began at `startedAt`: in seconds to the hundredth, never before the video began. */
export function videoSecondsOf(props: { at: number; startedAt: number }): number {
  return Math.max(0, Math.round((props.at - props.startedAt) / 10) / 100);
}
