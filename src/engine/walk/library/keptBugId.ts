import type { IKnownBug } from '@/contract';

/**
 * The bug already open an agent said it saw again, when it is one the run was told of;
 * null for a new bug or an id that names none.
 */
export function keptBugId(props: {
  asked: string | undefined;
  known: IKnownBug[];
}): string | null {
  const { asked, known } = props;

  return asked !== undefined && known.some(({ id }) => id === asked) ? asked : null;
}
