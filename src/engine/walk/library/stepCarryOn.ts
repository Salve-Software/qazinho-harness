/**
 * What the agent hears after a bug it saw on a step: report the step failed under the
 * same title when that is what the step expects, then carry on with it.
 */
export function stepCarryOn(step: number): string {
  const number = String(step);

  return `If it is what step ${number} expects, report step ${number} failed with this same title, so it stays one bug. Carry on with step ${number}.`;
}
