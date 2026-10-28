import type { IKnownBug } from '@/contract';
import { KNOWN_BUGS } from '@/constants';

/**
 * Os bugs já abertos, os mais recentes, nas linhas que os listam sob uma linha em branco,
 * com como dizer que um voltou; nada quando não há.
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
