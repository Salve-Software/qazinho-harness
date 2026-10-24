/** A bug already open in the workspace, as a run's agent hears of it: its id, the line it is known by, and the step it was caught on, unless it was seen outside the plan. */
export interface IKnownBug {
  id: string;
  title: string;
  caseId: string;
  stepNumber: number;
  isIncidental: boolean;
}
