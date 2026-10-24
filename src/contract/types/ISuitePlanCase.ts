/** A case of a workspace's plan the QA hands their agent to automate: the workspace it is in, and the case as its plan writes it. */
export interface ISuitePlanCase {
  workspace: string;
  id: string;
  title: string;
  goal: string;
  preconditions: string;
  steps: { action: string; expected: string }[];
}
