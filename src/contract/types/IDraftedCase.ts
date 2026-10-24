/** One case as the agent drafted it in a chat answer; `id` names the case of the plan it keeps or changes, and a new case has none; a step's `frame` is the Figma node its screen should match. */
export interface IDraftedCase {
  id?: string | undefined;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  goal: string;
  preconditions: string;
  steps: { action: string; expected: string; frame?: string | undefined }[];
}
