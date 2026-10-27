/**
 * A run's recording: `startedAt` is when its first frame shows, in epoch ms, so every
 * moment of the run finds its place in it.
 */
export interface IRunVideo {
  startedAt: number;
  durationMs: number;
  width: number;
  height: number;
}
