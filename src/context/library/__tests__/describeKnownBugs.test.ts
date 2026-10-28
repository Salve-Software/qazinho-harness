import type { IKnownBug } from '@/contract';
import { describe, expect, it } from 'vitest';
import { KNOWN_BUGS } from '@/constants';
import { describeKnownBugs } from '@/context/library';

const COUPON: IKnownBug = {
  id: 'BUG-01',
  title: 'An expired coupon is accepted',
  caseId: 'TC-02',
  stepNumber: 1,
  isIncidental: false,
};

describe('describeKnownBugs', () => {
  it('says nothing when the workspace has no bug open', () => {
    expect(describeKnownBugs([])).toEqual([]);
  });

  it('lists each bug by its id and where it was caught, with how to say it is seen again', () => {
    expect(
      describeKnownBugs([
        COUPON,
        { ...COUPON, id: 'BUG-02', title: 'Two prices disagree', isIncidental: true },
      ]),
    ).toEqual([
      '',
      'Bugs already open in this workspace: when you see one of them again, give its id as "sameAs" instead of filing it anew.',
      '- BUG-01 · An expired coupon is accepted (TC-02, step 1)',
      '- BUG-02 · Two prices disagree (outside the plan)',
    ]);
  });

  /**
   * Um workspace que roda há meses guarda todo bug que pegou; o agente de cada caso ouve
   * só os mais recentes.
   */
  it('lists only the latest bugs, and counts the older ones it leaves out', () => {
    const known = Array.from({ length: KNOWN_BUGS.shown + 2 }, (_, index) => ({
      ...COUPON,
      id: `BUG-${String(index + 1).padStart(2, '0')}`,
    }));
    const lines = describeKnownBugs(known);

    expect(lines[2]).toBe('- BUG-03 · An expired coupon is accepted (TC-02, step 1)');
    expect(lines.at(-1)).toBe('- and 2 older ones, not listed');
  });
});
