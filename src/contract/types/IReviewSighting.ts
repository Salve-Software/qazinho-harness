/** A time a run caught a filed bug again, as the agent reads it: the run, the step, what the run's agent noted, the screen it left and the requests that failed around it. */
export interface IReviewSighting {
  runId: string;
  runWhen: string;
  caseId: string;
  stepNumber: number;
  action: string;
  note: string;
  target: string;
  shot: string | null;
  requests: string[];
}
