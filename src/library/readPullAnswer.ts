import type { IPullAnswer, IPullBrief } from '@/types';
import { PULL_ANSWER } from '@/schemas/PULL_ANSWER';

/** The reader's answer, checked against its schema and the plans it was given: what names a plan, case or step the PR was not read against is left out; null when it is not one. */
export function readPullAnswer(props: {
  text: string;
  brief: IPullBrief;
}): IPullAnswer | null {
  try {
    const read = PULL_ANSWER.safeParse(JSON.parse(props.text));

    if (!read.success) return null;

    const caseOf = (planId: string, caseId: string) =>
      props.brief.plans
        .find(({ id }) => id === planId)
        ?.cases.find(({ id }) => id === caseId);
    const hasPlan = (planId: string) => props.brief.plans.some(({ id }) => id === planId);

    return {
      breaks: read.data.breaks
        .filter((one) => (caseOf(one.planId, one.caseId)?.steps.length ?? 0) >= one.step)
        .map((one) => ({
          ...one,
          action: one.action.trim(),
          expected: one.expected.trim(),
          why: one.why.trim(),
        })),
      reruns: read.data.reruns
        .filter((one) => caseOf(one.planId, one.caseId) !== undefined)
        .map((one) => ({ ...one, why: one.why.trim() })),
      newCases: read.data.newCases
        .filter((one) => hasPlan(one.planId))
        .map((one) => ({ ...one, title: one.title.trim(), why: one.why.trim() })),
    };
  } catch {
    return null;
  }
}
