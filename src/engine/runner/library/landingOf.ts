import type { IKnownBug } from '@/contract';
import type { Landing } from '@/engine/runner/types';

/**
 * Where a failure lands: the bug its agent named, its step's bug, one with its title, or
 * a new bug.
 */
export function landingOf(props: {
  sameAs: string | undefined;
  caseId: string;
  stepNumber: number;
  title: string;
  isIncidental: boolean;
  known: IKnownBug[];
  filed: IKnownBug[];
}): Landing {
  const words = wordsOf(props.title);
  const among = (bugs: IKnownBug[]) =>
    (props.sameAs === undefined
      ? undefined
      : bugs.find(({ id }) => id === props.sameAs)) ??
    (props.isIncidental
      ? undefined
      : bugs.find(
          (bug) =>
            !bug.isIncidental &&
            bug.caseId === props.caseId &&
            bug.stepNumber === props.stepNumber,
        )) ??
    (words.length === 0 ? undefined : bugs.find((bug) => wordsOf(bug.title) === words));
  const known = among(props.known);

  if (known !== undefined) return { kind: 'known', bugId: known.id };

  const filed = among(props.filed);

  return filed === undefined ? { kind: 'new' } : { kind: 'filed', bugId: filed.id };
}

const wordsOf = (title: string) => title.trim().toLowerCase().replace(/\s+/g, ' ');
