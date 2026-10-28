import type { IKnownBug } from '@/contract';
import type { RunnerJob } from '@/engine/runner/types';

/** Os bugs já abertos num plano, como os agentes do walk ficam sabendo deles. */
export function knownBugsOf(props: {
  bugs: RunnerJob['bugs'];
  planId: string;
}): IKnownBug[] {
  return props.bugs
    .filter(({ planId }) => planId === props.planId)
    .map(({ id, title, caseId, stepNumber, isIncidental }) => ({
      id,
      title,
      caseId,
      stepNumber,
      isIncidental,
    }));
}
