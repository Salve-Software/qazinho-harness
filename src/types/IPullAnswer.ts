/**
 * O que o leitor achou num pull request: os passos que ele quebra como ficarão, os casos
 * que toca e os casos que pede; cada um nomeado pelo arquivo que o muda.
 */
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
