import type { IHarnessSection } from '@/context/types';
import type { IChatReference } from '@/contract';

/**
 * How the workspace's latest runs went, as a section the agent answers from; nothing
 * before the first run.
 */
export function describeRuns(runs: IChatReference[]): IHarnessSection {
  return {
    title: 'Runs in this workspace',
    lines: runs.flatMap((run) => [
      `run ${run.id} · ${run.title}`,
      ...run.facts.map((fact) => `  ${fact}`),
    ]),
  };
}
