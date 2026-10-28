import type { IRunStepBody } from './IRunStepBody';

/**
 * A run de um plano como um runner a manda: quando e como terminou, em quê, como foram os
 * casos, e o vídeo e as requisições pela chave.
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
