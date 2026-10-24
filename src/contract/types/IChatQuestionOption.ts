import type { IVariableBrief } from './IVariableBrief';

/** An answer the QA can pick to the agent's question, and what picking it means; one with `variables` opens a window for the QA to type their values. */
export interface IChatQuestionOption {
  label: string;
  description: string;
  variables?: IVariableBrief[];
}
