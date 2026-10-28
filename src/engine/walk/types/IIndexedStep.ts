import type { IFlatStep } from '@/contract';

/** Um passo de um caso com o lugar na run inteira. */
export interface IIndexedStep {
  step: IFlatStep;
  index: number;
}
