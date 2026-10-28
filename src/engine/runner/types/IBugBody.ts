import type { ISightingBody } from './ISightingBody';
import type { Severity } from '@/contract';

/**
 * Um bug que um runner abre, como a API o recebe: as palavras, onde quebrou, como chegar
 * até ele, as telas pela chave, e a run que o pegou.
 */
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
