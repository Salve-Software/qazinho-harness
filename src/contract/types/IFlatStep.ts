/**
 * Um plano achatado para executar: cada passo de cada caso na ordem em que o agente os
 * anda, cada um com o caso, e o nó do Figma com que a tela deve bater.
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
}
