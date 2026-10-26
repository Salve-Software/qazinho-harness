import type { IKnownBug } from '@/contract';
import type { RunnerJob } from '@/engine/runner/types';

/** The bugs already open on one plan, as its walk's agents hear of them. */
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
