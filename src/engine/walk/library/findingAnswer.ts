/** What the agent hears once a bug it saw is in: counted on the bug already open it named, or filed anew, then what to do next. */
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
