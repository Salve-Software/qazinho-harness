import type { ISightingBody } from './ISightingBody';
import type { Severity } from '@/contract';

/** A bug a runner files, as the API takes it: its words, where it broke, how to reach it, its screens by key, and the run that caught it. */
export interface IBugBody {
  severity: Severity;
  title: string;
  body: string;
  expected: string;
  got: string;
  caseId: string;
  caseTitle: string;
  stepNumber: number;
  target: string;
  isIncidental: boolean;
  isDismissed: boolean;
  filed: null;
  repro: { action: string; isBad: boolean }[];
  shots: { key: string | null; isBad: boolean }[];
  caught: ISightingBody;
  sightings: ISightingBody[];
  firstSeenAt: string;
}
