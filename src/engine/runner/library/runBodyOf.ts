import type { IFlatStep, IStepOutcome } from '@/contract';
import type { IRunBody, IRunStepBody, IWalkLog, RunnerJob } from '@/engine/runner/types';
import { RUNNER } from '@/engine/runner/constants';
import { caseVerdictOf } from './caseVerdictOf';
import { videoSecondsOf } from './videoSecondsOf';

/**
 * A plan's walk as the run the API keeps: each case with each step's verdict, why, bug,
 * screen and place on the video; a step the walk never reached is skipped.
 */
export function runBodyOf(props: {
  plan: RunnerJob['plans'][number];
  steps: IFlatStep[];
  log: IWalkLog;
  target: RunnerJob['target'];
  endedBy: IRunBody['endedBy'];
  keys: Record<string, string>;
  bugIds: Map<number, string>;
  video: { key: string; startedAt: number } | null;
  network: string | null;
}): IRunBody {
  const { log, keys, video } = props;
  const settled = new Map(log.outcomes.map((outcome) => [outcome.index, outcome]));
  const secondsOf = (at: number) =>
    video === null ? 0 : videoSecondsOf({ at, startedAt: video.startedAt });
  const cases = props.plan.cases.map((testCase) => {
    const walked = props.steps.flatMap((step, index) =>
      step.caseId === testCase.id ? [{ step, index, outcome: settled.get(index) }] : [],
    );
    const steps = walked.map(({ step, index, outcome }): IRunStepBody => {
      if (outcome === undefined)
        return {
          number: step.numberInCase,
          action: step.action,
          verdict: 'skipped',
          why: RUNNER.unwalked,
          bugId: null,
          shot: null,
          by: 'agent',
          proof: null,
          span: null,
        };

      const began = log.began.get(index) ?? outcome.at;

      return {
        number: step.numberInCase,
        action: step.action,
        verdict: verdictOf(outcome),
        why: outcome.why.length > 0 ? outcome.why : null,
        bugId: props.bugIds.get(index) ?? null,
        shot: outcome.shotFile === null ? null : (keys[outcome.shotFile] ?? null),
        by: outcome.by ?? 'agent',
        proof: outcome.by === 'replay' && outcome.got.length > 0 ? outcome.got : null,
        span:
          video === null ? null : { from: secondsOf(began), to: secondsOf(outcome.at) },
      };
    });
    const moments = walked.flatMap(({ index, outcome }) =>
      outcome === undefined ? [] : [log.began.get(index) ?? outcome.at, outcome.at],
    );

    return {
      id: testCase.id,
      title: testCase.title,
      verdict: caseVerdictOf(steps.map(({ verdict }) => verdict)),
      durationSec:
        moments.length === 0
          ? 0
          : Math.round((Math.max(...moments) - Math.min(...moments)) / 100) / 10,
      steps,
    };
  });

  return {
    kind: 'run',
    startedAt: new Date(log.startedAt).toISOString(),
    durationSec: Math.max(0, Math.round((log.endedAt - log.startedAt) / 100) / 10),
    endedBy: props.endedBy,
    target: props.target,
    counts: {
      passed: cases.filter(({ verdict }) => verdict === 'passed').length,
      failed: cases.filter(({ verdict }) => verdict === 'failed').length,
      blocked: cases.filter(({ verdict }) => verdict === 'blocked').length,
      skipped: cases.filter(({ verdict }) => verdict === 'skipped').length,
    },
    cases,
    video: video?.key ?? null,
    videoStartedAt: video === null ? null : new Date(video.startedAt).toISOString(),
    network: props.network,
    costUsd: null,
  };
}

const verdictOf = (outcome: IStepOutcome): IRunStepBody['verdict'] =>
  outcome.verdict === 'passed' ||
  outcome.verdict === 'failed' ||
  outcome.verdict === 'blocked'
    ? outcome.verdict
    : 'skipped';
