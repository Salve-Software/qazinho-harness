import type { IStepOutcome } from '@/contract';
import type { IBugBody, ICatch } from '@/engine/runner/types';
import { videoSecondsOf } from './videoSecondsOf';

/**
 * A failure or a finding as a new bug: what broke, the steps to it, its screens and its
 * moment on the video.
 */
export function bugBodyOf(props: {
  caught: ICatch;
  caseTitle: string;
  outcomes: IStepOutcome[];
  target: string;
  run: { id: string; when: string; videoStartedAt: number | null };
  keys: Record<string, string>;
}): IBugBody {
  const { caught, outcomes, keys, run } = props;
  const keyOf = (file: string | null) => (file === null ? null : (keys[file] ?? null));
  const before = outcomes
    .filter(({ index, shotFile }) => index < caught.index && shotFile !== null)
    .at(-1);
  const shot = keyOf(caught.shotFile);

  return {
    severity: caught.severity,
    title: caught.title.length > 0 ? caught.title : caught.action,
    body: caught.why,
    expected: caught.expected,
    got: caught.got,
    caseId: caught.caseId,
    caseTitle: props.caseTitle,
    stepNumber: caught.stepNumber,
    target: props.target,
    isIncidental: caught.isIncidental,
    isDismissed: false,
    filed: null,
    repro: outcomes
      .filter(({ caseId, index }) => caseId === caught.caseId && index <= caught.index)
      .map(({ action, index }) => ({ action, isBad: index === caught.index })),
    shots: [
      ...(before === undefined ? [] : [{ key: keyOf(before.shotFile), isBad: false }]),
      { key: shot, isBad: true },
    ],
    caught: {
      runId: run.id,
      runWhen: run.when,
      caseId: caught.caseId,
      stepNumber: caught.stepNumber,
      shot,
      at:
        run.videoStartedAt === null
          ? null
          : videoSecondsOf({ at: caught.at, startedAt: run.videoStartedAt }),
    },
    sightings: [],
    firstSeenAt: run.when,
  };
}
