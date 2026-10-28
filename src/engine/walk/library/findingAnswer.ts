/**
 * O que o agente ouve quando um bug que ele viu entra: contado no bug já aberto que ele
 * nomeou, ou aberto como novo, e então o que fazer em seguida.
 */
export function findingAnswer(props: {
  asked: string | undefined;
  kept: string | null;
  carryOn: string;
}): string {
  const { asked, kept, carryOn } = props;

  if (kept !== null) return `Counted as ${kept} seen again. ${carryOn}`;

  if (asked !== undefined)
    return `There is no ${asked} open, so it was filed as a new bug. ${carryOn}`;

  return `Filed as a bug. ${carryOn}`;
}
