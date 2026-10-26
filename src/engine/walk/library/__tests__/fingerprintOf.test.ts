import { describe, expect, it } from 'vitest';
import { fingerprintOf } from '@/engine/walk/library';
import { STEPS } from './fixtures';

describe('fingerprintOf', () => {
  it('reads the same case the same way, on the same kind of target', () => {
    expect(fingerprintOf({ targetKind: 'android', steps: STEPS })).toBe(
      fingerprintOf({ targetKind: 'android', steps: STEPS.map((step) => ({ ...step })) }),
    );
  });

  it('changes when a step, an expectation, the preconditions or the target kind change', () => {
    const base = fingerprintOf({ targetKind: 'android', steps: STEPS });
    const [first, second] = STEPS;

    if (first === undefined || second === undefined) throw new Error('fixture');

    expect(
      fingerprintOf({
        targetKind: 'android',
        steps: [{ ...first, action: 'Tap Save' }, second],
      }),
    ).not.toBe(base);
    expect(
      fingerprintOf({
        targetKind: 'android',
        steps: [first, { ...second, expected: 'Visits: 2' }],
      }),
    ).not.toBe(base);
    expect(
      fingerprintOf({
        targetKind: 'android',
        steps: STEPS.map((step) => ({ ...step, casePreconditions: 'Signed in' })),
      }),
    ).not.toBe(base);
    expect(fingerprintOf({ targetKind: 'ios', steps: STEPS })).not.toBe(base);
  });

  it('does NOT change with the title or the priority, which a walk never reads', () => {
    expect(
      fingerprintOf({
        targetKind: 'android',
        steps: STEPS.map((step) => ({
          ...step,
          caseTitle: 'Renamed',
          casePriority: 'P3',
        })),
      }),
    ).toBe(fingerprintOf({ targetKind: 'android', steps: STEPS }));
  });
});
