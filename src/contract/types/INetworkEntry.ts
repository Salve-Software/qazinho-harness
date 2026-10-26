/** A request the app under test made during a run, and how it ended; `startedAt` is epoch ms, `durationMs` is null for one still going when the run ended, and `body` is the start of what an API call that failed answered. */
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
