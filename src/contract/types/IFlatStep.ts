/**
 * Um plano achatado para executar: cada passo de cada caso na ordem em que o agente os
 * anda, com o caso, a conta em que ele começa, o nó do Figma e se o QA o anda à mão.
 */
export interface IFlatStep {
  caseId: string;
  caseTitle: string;
  casePriority: string;
  caseGoal: string;
  casePreconditions: string;
  caseSignedInAs?: string;
  numberInCase: number;
  action: string;
  expected: string;
  frame?: string;
  caseIsManual?: boolean;
}
