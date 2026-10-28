/**
 * Uma run contada numa linha: o dia e a hora em que começou, como terminou, e no que
 * deram os passos.
 */
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
