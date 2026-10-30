import { describe, expect, it } from 'vitest';
import { outcomeOfReport } from '@/engine/walk/library';

const STEP = {
  caseId: 'TC-02',
  caseTitle: 'Coupon',
  casePriority: 'P1',
  caseGoal: '',
  casePreconditions: '',
  numberInCase: 2,
  action: 'Apply SAVE10',
  expected: 'The total drops by 10%',
};

const REPORT = {
  step: 2,
  verdict: 'failed' as const,
  why: 'The total stayed the same',
  got: 'R$ 100,00',
  title: 'Coupon SAVE10 does not change the total',
  severity: 'high' as const,
  goesOn: false,
  note: '',
  proof: '',
};

describe('outcomeOfReport', () => {
  it('files the verdict with the step it belongs to, how long it took and when it came', () => {
    expect(
      outcomeOfReport({
        report: REPORT,
        step: STEP,
        index: 5,
        workspaceId: 'w1',
        tookMs: 4200,
        at: 1_760_000_004_200,
        shot: null,
      }),
    ).toMatchObject({
      caseId: 'TC-02',
      stepNumber: 2,
      index: 5,
      verdict: 'failed',
      got: 'R$ 100,00',
      title: 'Coupon SAVE10 does not change the total',
      severity: 'high',
      tookMs: 4200,
      at: 1_760_000_004_200,
    });
  });

  it('keeps the Figma frame a failed step is off, so its bug is one off the design', () => {
    const filed = (
      report: Omit<typeof REPORT, 'verdict'> & {
        verdict: 'passed' | 'failed';
        frame?: string;
      },
    ) =>
      outcomeOfReport({
        report,
        step: STEP,
        index: 5,
        workspaceId: 'w1',
        tookMs: 0,
        at: 1,
        shot: null,
      });

    expect(filed({ ...REPORT, frame: '12:345' }).frame).toBe('12:345');
    expect(filed({ ...REPORT, verdict: 'passed', frame: '12:345' })).not.toHaveProperty(
      'frame',
    );
    expect(filed(REPORT)).not.toHaveProperty('frame');
  });

  it('keeps the screenshot taken when the report arrived as the evidence', () => {
    expect(
      outcomeOfReport({
        report: REPORT,
        step: STEP,
        index: 5,
        workspaceId: 'w1',
        tookMs: 0,
        at: 1_760_000_000_000,
        shot: { file: '/runs/step-6.jpg', dataUrl: 'data:image/jpeg;base64,AA' },
      }),
    ).toMatchObject({
      screenshot: 'data:image/jpeg;base64,AA',
      shotFile: '/runs/step-6.jpg',
    });
  });
});
