/**
 * Um bug do workspace como o agente de uma run o conhece: o id, a linha que o nomeia, o
 * passo em que foi pego, e se o QA disse que não é bug.
 */
export interface IKnownBug {
  id: string;
  title: string;
  caseId: string;
  stepNumber: number;
  isIncidental: boolean;
  isDismissed?: boolean;
}
