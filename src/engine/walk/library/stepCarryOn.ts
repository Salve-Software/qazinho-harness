/**
 * O que o agente ouve depois de um bug que viu num passo: relatar o passo como falho com
 * o mesmo título quando é isso que o passo espera, e então seguir com ele.
 */
export function stepCarryOn(step: number): string {
  const number = String(step);

  return `If it is what step ${number} expects, report step ${number} failed with this same title, so it stays one bug. Carry on with step ${number}.`;
}
