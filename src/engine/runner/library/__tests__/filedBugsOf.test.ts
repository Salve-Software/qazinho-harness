import { describe, expect, it } from 'vitest';
import { filedBugsOf } from '@/engine/runner/library';
import { LOG, outcomeOf } from './fixtures';

const RUN = {
  id: 'runner-j1-plan-1',
  when: '2026-10-24T10:00:00.000Z',
  videoStartedAt: 1_760_000_000_000,
};
const KEYS = { '/runs/r1/step-1.jpg': 'ev/1', '/runs/r1/step-2.jpg': 'ev/2' };

const filedWith = (known: Parameters<typeof filedBugsOf>[0]['known'], log = LOG) =>
  filedBugsOf({
    log,
    known,
    caseTitleOf: (caseId) => (caseId === 'pix' ? 'Pay with Pix' : caseId),
    target: 'Web · Chrome 1280 × 800',
    run: RUN,
    keys: KEYS,
  });

describe('filedBugsOf', () => {
  it('files a failure no open bug is as a new bug, with its steps, screens and the run that caught it', () => {
    const filed = filedWith([]);

    expect(filed.bugIds).toEqual(new Map([[1, 'runner-j1-plan-1-bug-1']]));
    expect(filed.sightings).toEqual([]);
    expect(filed.newBugs).toEqual([
      {
        id: 'runner-j1-plan-1-bug-1',
        body: {
          severity: 'high',
          title: 'Pix code never shows',
          body: 'No Pix code',
          expected: 'The Pix code shows',
          got: 'A spinner',
          caseId: 'pix',
          caseTitle: 'Pay with Pix',
          stepNumber: 2,
          target: 'Web · Chrome 1280 × 800',
          isIncidental: false,
          isDismissed: false,
          filed: null,
          repro: [
            { action: 'Open the cart', isBad: false },
            { action: 'Pay with Pix', isBad: true },
          ],
          shots: [
            { key: 'ev/1', isBad: false },
            { key: 'ev/2', isBad: true },
          ],
          caught: {
            runId: 'runner-j1-plan-1',
            runWhen: '2026-10-24T10:00:00.000Z',
            caseId: 'pix',
            stepNumber: 2,
            shot: 'ev/2',
            at: 20,
          },
          sightings: [],
          firstSeenAt: '2026-10-24T10:00:00.000Z',
        },
      },
    ]);
  });

  it('sees an open bug again once, however many steps fail for it', () => {
    const filed = filedWith(
      [
        {
          id: 'b1',
          title: 'Pix code never shows',
          caseId: 'pix',
          stepNumber: 2,
          isIncidental: false,
        },
      ],
      {
        ...LOG,
        outcomes: [
          ...LOG.outcomes,
          outcomeOf({
            index: 3,
            verdict: 'failed',
            title: 'Pix code never shows',
            sameAs: 'b1',
          }),
        ],
      },
    );

    expect(filed.newBugs).toEqual([]);
    expect(filed.bugIds).toEqual(
      new Map([
        [1, 'b1'],
        [3, 'b1'],
      ]),
    );
    expect(filed.sightings).toEqual([
      {
        bugId: 'b1',
        sighting: {
          runId: 'runner-j1-plan-1',
          runWhen: '2026-10-24T10:00:00.000Z',
          caseId: 'pix',
          stepNumber: 2,
          shot: 'ev/2',
          at: 20,
        },
      },
    ]);
  });

  it('files a bug seen beside a step on the side, and names it on no step', () => {
    const filed = filedWith([], {
      ...LOG,
      outcomes: [LOG.outcomes[0]!],
      findings: [
        {
          caseId: 'pix',
          stepNumber: 1,
          index: 0,
          action: 'Open the cart',
          title: 'Total shows twice',
          severity: 'low',
          at: 1_760_000_007_000,
          expected: 'One total',
          got: 'Two totals',
          screenshot: null,
          shotFile: '/runs/r1/finding-1-1.jpg',
        },
      ],
    });

    expect(filed.bugIds).toEqual(new Map());
    expect(filed.newBugs[0]?.body).toMatchObject({
      title: 'Total shows twice',
      isIncidental: true,
      expected: 'One total',
      got: 'Two totals',
    });
  });
});
