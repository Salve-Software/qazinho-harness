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

  /**
   * O QA marcou "o cartão sem campos" como não-bug, e o explorador o perguntou de novo
   * minutos depois.
   */
  it('lists what the QA said is not a bug apart, to be neither filed nor asked again', () => {
    const lines = describeKnownBugs([
      {
        id: 'BUG-01',
        title: 'Wrong price',
        caseId: 'TC-03',
        stepNumber: 1,
        isIncidental: false,
      },
      {
        id: 'BUG-06',
        title: 'No card fields',
        caseId: 'TC-12',
        stepNumber: 2,
        isIncidental: false,
        isDismissed: true,
      },
    ]);

    expect(lines).toContain('- BUG-01 · Wrong price (TC-03, step 1)');
    expect(lines.join('\n')).toMatch(/not bugs[\s\S]*- BUG-06 · No card fields/);
    expect(lines.indexOf('- BUG-06 · No card fields (TC-12, step 2)')).toBeGreaterThan(
      lines.indexOf('- BUG-01 · Wrong price (TC-03, step 1)'),
    );
  });

  it('says nothing about open bugs when every one was set aside', () => {
    const lines = describeKnownBugs([
      {
        id: 'BUG-06',
        title: 'No card fields',
        caseId: 'TC-12',
        stepNumber: 2,
        isIncidental: false,
        isDismissed: true,
      },
    ]);

    expect(lines.join('\n')).not.toContain('already open');
  });
});
