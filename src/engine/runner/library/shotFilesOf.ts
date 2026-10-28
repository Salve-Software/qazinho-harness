import type { IPlanWalk } from '@/engine/runner/types';

/**
 * Toda tela que os walks de um job guardaram, cada uma uma vez: as dos passos e as dos
 * bugs vistos ao lado deles.
 */
export function shotFilesOf(walks: IPlanWalk[]): string[] {
  return [
    ...new Set(
      walks.flatMap(({ log }) => [
        ...log.outcomes.flatMap(({ shotFile }) => (shotFile === null ? [] : [shotFile])),
        ...log.findings.flatMap(({ shotFile }) => (shotFile === null ? [] : [shotFile])),
      ]),
    ),
  ];
}
