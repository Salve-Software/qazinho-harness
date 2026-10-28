/**
 * Um bug já aberto no workspace, como o agente de uma run o conhece: o id, a linha que o
 * nomeia e o passo em que foi pego, se foi pego num passo do plano.
 */
export interface IKnownBug {
  id: string;
  title: string;
  caseId: string;
  stepNumber: number;
  isIncidental: boolean;
}
