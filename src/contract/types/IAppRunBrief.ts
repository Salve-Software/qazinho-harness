/** A run told in a line: the day and time it started, how it ended, and what its steps came to. */
export interface IAppRunBrief {
  id: string;
  startedOn: string | null;
  startedAt: string;
  endedBy: 'finished' | 'stopped' | 'broke' | 'interrupted';
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
}
