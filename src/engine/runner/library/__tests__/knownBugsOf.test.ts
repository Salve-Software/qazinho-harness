import { describe, expect, it } from 'vitest';
import { knownBugsOf } from '@/engine/runner/library';

describe('knownBugsOf', () => {
  it('hands a plan’s walk the bugs open on it, and none of another plan’s', () => {
    expect(
      knownBugsOf({
        bugs: [
          {
            id: 'b1',
            planId: 'plan-1',
            title: 'Pix never shows',
            caseId: 'pix',
            stepNumber: 2,
            isIncidental: false,
            status: 'open',
          },
          {
            id: 'b2',
            planId: 'plan-2',
            title: 'Other',
            caseId: 'x',
            stepNumber: 1,
            isIncidental: true,
            status: 'sent',
          },
        ],
        planId: 'plan-1',
      }),
    ).toEqual([
      {
        id: 'b1',
        title: 'Pix never shows',
        caseId: 'pix',
        stepNumber: 2,
        isIncidental: false,
      },
    ]);
  });
});
