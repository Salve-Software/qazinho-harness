/**
 * O que o leitor de um pull request respondeu: o que ele provavelmente quebra, os passos
 * que muda, os casos que toca e os que pede.
 */
export interface IPullAnswer {
  risks: { why: string; file: string }[];
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
