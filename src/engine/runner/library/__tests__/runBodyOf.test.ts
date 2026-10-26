import { describe, expect, it } from 'vitest';
import { RUNNER } from '@/engine/runner/constants';
import { runBodyOf } from '@/engine/runner/library';
import { LOG, PLAN, STEPS } from './fixtures';

const TARGET = {
  kind: 'web' as const,
  label: 'Preview',
  value: 'https://pr-482.loja.test',
};

const body = (video: { key: string; startedAt: number } | null) =>
  runBodyOf({
    plan: PLAN,
    steps: STEPS,
    log: LOG,
    target: TARGET,
    endedBy: 'finished',
    keys: { '/runs/r1/step-1.jpg': 'ev/1', '/runs/r1/step-2.jpg': 'ev/2' },
    bugIds: new Map([[1, 'b1']]),
    video,
    network: 'ev/net',
  });

describe('runBodyOf', () => {
  it('writes each case with its steps’ verdicts, why, bug and screens by key', () => {
    const run = body(null);

    expect(run.cases[0]).toMatchObject({
      id: 'pix',
      verdict: 'failed',
      steps: [
        {
          number: 1,
          verdict: 'passed',
          why: null,
          shot: 'ev/1',
          bugId: null,
          by: 'agent',
        },
        { number: 2, verdict: 'failed', why: 'No Pix code', shot: 'ev/2', bugId: 'b1' },
        { number: 3, verdict: 'skipped', shot: null },
      ],
    });
    expect(run).toMatchObject({
      startedAt: new Date(LOG.startedAt).toISOString(),
      durationSec: 42,
      counts: { passed: 0, failed: 1, blocked: 0, skipped: 1 },
      network: 'ev/net',
      video: null,
      videoStartedAt: null,
    });
  });

  it('skips the steps a walk never reached, saying so', () => {
    expect(body(null).cases[1]).toEqual({
      id: 'coupon',
      title: 'Apply a coupon',
      verdict: 'skipped',
      durationSec: 0,
      steps: [
        {
          number: 1,
          action: 'Apply OFF10',
          verdict: 'skipped',
          why: RUNNER.unwalked,
          bugId: null,
          shot: null,
          by: 'agent',
          proof: null,
          span: null,
        },
      ],
    });
  });

  it('places each step on the video, from when it began to when it settled', () => {
    const run = body({ key: 'ev/video', startedAt: 1_760_000_000_000 });

    expect(run.cases[0]?.steps.map(({ span }) => span)).toEqual([
      { from: 5, to: 10 },
      { from: 12, to: 20 },
      { from: 30, to: 30 },
    ]);
    expect(run).toMatchObject({
      video: 'ev/video',
      videoStartedAt: new Date(1_760_000_000_000).toISOString(),
    });
  });
});
