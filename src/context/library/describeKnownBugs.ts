import type { IKnownBug } from '@/contract';
import { KNOWN_BUGS } from '@/constants';

/**
 * The bugs already open, the latest ones, as the lines that list them under a blank line
 * with how to say one is seen again; none when there are none.
 */
export function describeKnownBugs(known: IKnownBug[]): string[] {
  if (known.length === 0) return [];

  const shown = known.slice(-KNOWN_BUGS.shown);
  const older = known.length - shown.length;

  return [
    '',
    'Bugs already open in this workspace: when you see one of them again, give its id as "sameAs" instead of filing it anew.',
    ...shown.map(({ id, title, caseId, stepNumber, isIncidental }) =>
      isIncidental
        ? `- ${id} · ${title} (outside the plan)`
        : `- ${id} · ${title} (${caseId}, step ${String(stepNumber)})`,
    ),
    ...(older === 0
      ? []
      : [`- and ${String(older)} older one${older === 1 ? '' : 's'}, not listed`]),
  ];
}
