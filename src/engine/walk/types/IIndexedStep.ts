import type { IFlatStep } from '@/contract';

/** A step of a case with its place in the whole run. */
export interface IIndexedStep {
  step: IFlatStep;
  index: number;
}
