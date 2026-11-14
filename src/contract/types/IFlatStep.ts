/**
 * Um plano achatado para executar: cada passo de cada caso na ordem em que o agente os
 * anda, com o caso, o nó do Figma da tela e se o QA anda o caso à mão.
 */
export interface IFlatStep {
  caseId: string;
  caseTitle: string;
  casePriority: string;
  caseGoal: string;
  casePreconditions: string;
  numberInCase: number;
  action: string;
  expected: string;
  frame?: string;
  caseIsManual?: boolean;
}
