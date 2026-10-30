import type { IKnownBug } from '@/contract';
import { KNOWN_BUGS } from '@/constants';

/**
 * Os bugs abertos, os mais recentes, com como dizer que um voltou, e os que o QA disse
 * que não são bugs; nada quando não há.
 */
export function describeKnownBugs(known: IKnownBug[]): string[] {
  const open = known.filter((bug) => bug.isDismissed !== true);
  const dismissed = known
    .filter((bug) => bug.isDismissed === true)
    .slice(-KNOWN_BUGS.shown);
  const shown = open.slice(-KNOWN_BUGS.shown);
  const older = open.length - shown.length;

  return [
    ...(open.length === 0
      ? []
      : [
          '',
          'Bugs already open in this workspace: when you see one of them again, give its id as "sameAs" instead of filing it anew.',
          ...shown.map(lineOf),
          ...(older === 0
            ? []
            : [`- and ${String(older)} older one${older === 1 ? '' : 's'}, not listed`]),
        ]),
    ...(dismissed.length === 0
      ? []
      : [
          '',
          'The QA said these are not bugs, as the app means them to be: do not file them again nor ask the QA about them.',
          ...dismissed.map(lineOf),
        ]),
  ];
}

function lineOf({ id, title, caseId, stepNumber, isIncidental }: IKnownBug): string {
  return isIncidental
    ? `- ${id} · ${title} (outside the plan)`
    : `- ${id} · ${title} (${caseId}, step ${String(stepNumber)})`;
}
