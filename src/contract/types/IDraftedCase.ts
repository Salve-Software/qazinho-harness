/**
 * One case the agent drafted: `id` names the case it changes, none for a new one; a
 * step's `frame` is its Figma node.
 */
export interface IDraftedCase {
  id?: string | undefined;
  title: string;
  priority: 'P1' | 'P2' | 'P3';
  goal: string;
  preconditions: string;
  steps: { action: string; expected: string; frame?: string | undefined }[];
}
