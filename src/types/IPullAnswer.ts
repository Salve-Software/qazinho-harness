/** What the reader found in a pull request: the steps it breaks as they will read, the cases it touches, and the cases it asks for; each named by the file that changes it. */
export interface IPullAnswer {
  breaks: {
    planId: string;
    caseId: string;
    step: number;
    action: string;
    expected: string;
    why: string;
    file: string;
  }[];
  reruns: { planId: string; caseId: string; why: string; file: string }[];
  newCases: {
    planId: string;
    title: string;
    goal: string;
    steps: { action: string; expected: string }[];
    why: string;
    file: string;
  }[];
}
