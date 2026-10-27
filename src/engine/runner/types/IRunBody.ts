import type { IRunStepBody } from './IRunStepBody';

/**
 * A plan's run as a runner sends it: when and how it ended, on what, how its cases went,
 * and its video and requests by key.
 */
export interface IRunBody {
  kind: 'run';
  startedAt: string;
  durationSec: number;
  endedBy: 'finished' | 'stopped' | 'broke' | 'interrupted';
  target: { kind: 'web' | 'android' | 'ios'; label: string; value: string };
  counts: { passed: number; failed: number; blocked: number; skipped: number };
  cases: {
    id: string;
    title: string;
    verdict: 'passed' | 'failed' | 'blocked' | 'skipped';
    durationSec: number;
    steps: IRunStepBody[];
  }[];
  video: string | null;
  videoStartedAt: string | null;
  network: string | null;
  costUsd: null;
}
