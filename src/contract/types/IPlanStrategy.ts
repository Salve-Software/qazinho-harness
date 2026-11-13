/**
 * Como o plano testa: o que cobre, o que fica fora, onde roda, as contas e os dados, e os
 * riscos que ele mira.
 */
export interface IPlanStrategy {
  covers: string;
  leavesOut: string;
  where: string;
  data: string;
  risks: string;
}
