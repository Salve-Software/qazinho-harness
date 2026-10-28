import type { IKnownBug } from '@/contract';

/**
 * O bug já aberto que um agente disse ter visto de novo, quando é um de que a run foi
 * avisada; null para um bug novo ou um id que não nomeia nenhum.
 */
export function keptBugId(props: {
  asked: string | undefined;
  known: IKnownBug[];
}): string | null {
  const { asked, known } = props;

  return asked !== undefined && known.some(({ id }) => id === asked) ? asked : null;
}
