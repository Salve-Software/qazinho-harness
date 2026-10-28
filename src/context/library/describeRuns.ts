import type { IHarnessSection } from '@/context/types';
import type { IChatReference } from '@/contract';

/**
 * Como foram as últimas runs do workspace, como uma seção a partir da qual o agente
 * responde; nada antes da primeira run.
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
