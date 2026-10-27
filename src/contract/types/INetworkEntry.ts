/**
 * A request the app made during a run and how it ended; `body` starts what a failed API
 * call answered.
 */
export interface INetworkEntry {
  id: number;
  method: string;
  url: string;
  type: string;
  status: number | null;
  failure: string | null;
  startedAt: number;
  durationMs: number | null;
  size: number | null;
  body?: string;
}
