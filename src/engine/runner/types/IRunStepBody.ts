/** One step of a run as the API takes it: what was done, how it went and why, the bug it broke on, its screen's key, who walked it, and where it sits on the video. */
export interface IRunStepBody {
  number: number;
  action: string;
  verdict: 'passed' | 'failed' | 'blocked' | 'skipped';
  why: string | null;
  bugId: string | null;
  shot: string | null;
  by: 'agent' | 'replay' | 'healed';
  proof: string | null;
  span: { from: number; to: number } | null;
}
