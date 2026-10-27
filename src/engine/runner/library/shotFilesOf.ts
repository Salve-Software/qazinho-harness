import type { IPlanWalk } from '@/engine/runner/types';

/**
 * Every screen a job's walks kept, each once: the steps' and the bugs seen beside them.
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
