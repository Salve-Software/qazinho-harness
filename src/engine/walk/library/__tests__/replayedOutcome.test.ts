import { describe, expect, it } from 'vitest';
import { replayedOutcome } from '@/engine/walk/library';
import { STEPS } from './fixtures';

describe('replayedOutcome', () => {
  it('passes a step walked again without the agent, with its proof as what the screen said', () => {
    const [step] = STEPS;

    if (step === undefined) throw new Error('fixture');

    expect(
      replayedOutcome({
        step,
        index: 0,
        workspaceId: 'w-1',
        proof: 'Visitas: 1',
        tookMs: 900,
        at: 1_760_000_000_000,
        shot: { file: '/runs/step-1.jpg', dataUrl: 'data:image/jpeg;base64,AA' },
      }),
    ).toMatchObject({
      caseId: 'TC-01',
      stepNumber: 1,
      verdict: 'passed',
      got: 'Visitas: 1',
      by: 'replay',
      shotFile: '/runs/step-1.jpg',
      tookMs: 900,
    });
  });

  it('says each line of a proof of several, in one line the QA reads', () => {
    const [step] = STEPS;

    if (step === undefined) throw new Error('fixture');

    expect(
      replayedOutcome({
        step,
        index: 0,
        workspaceId: 'w-1',
        proof: '1 item: Caneca\nTotal: R$ 30,00',
        tookMs: 900,
        at: 1_760_000_000_000,
        shot: null,
      }).got,
    ).toBe('1 item: Caneca · Total: R$ 30,00');
  });
});
