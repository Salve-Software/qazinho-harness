/**
 * Um caso do plano de um workspace que o QA entrega ao agente para automatizar: o
 * workspace em que está, e o caso como o plano o escreve.
 */
export interface ISuitePlanCase {
  workspace: string;
  id: string;
  title: string;
  goal: string;
  preconditions: string;
  steps: { action: string; expected: string }[];
}
