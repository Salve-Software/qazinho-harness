import type { IMemoryBrief } from '@/contract';
import type { RunnerJob } from '@/engine/runner/types';
import { MEMORIES_SHOWN } from '@/engine/runner/constants';

/** O que o agente aprendeu do app e vale neste plano, as memórias mais recentes. */
export function memoriesOfPlan(props: {
  memories: RunnerJob['memories'];
  planId: string;
}): IMemoryBrief[] {
  return props.memories
    .filter(({ planId }) => planId === null || planId === props.planId)
    .slice(-MEMORIES_SHOWN)
    .map(({ id, text, scope, target }) => ({ id, text, scope, target }));
}
