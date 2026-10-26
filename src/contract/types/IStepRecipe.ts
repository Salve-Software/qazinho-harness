import type { IStepAction } from './IStepAction';

/** One step of a case as a passing run walked it: what was done on the device, and the words on screen that proved it held. */
export interface IStepRecipe {
  number: number;
  actions: IStepAction[];
  proof: string;
}
