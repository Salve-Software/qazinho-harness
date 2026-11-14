import { describe, expect, it } from 'vitest';
import { describePrep } from '@/context/library';

const STEP = {
  caseId: 'TC-07',
  caseTitle: 'The invoice PDF reads well',
  casePriority: 'P2',
  caseGoal: '',
  casePreconditions: 'Signed in, on order 1042',
  numberInCase: 1,
  action: 'Download the invoice',
  expected: 'A PDF downloads',
  caseIsManual: true,
};

describe('describePrep', () => {
  it('asks only for the preconditions, as step 1, and lists the steps that are the QA’s', () => {
    const message = describePrep({
      steps: [STEP, { ...STEP, numberInCase: 2, action: 'Open the PDF' }],
      screen: 'heading "Shop"',
      language: 'pt',
      variables: [{ name: 'SHOP_EMAIL', description: 'The test account' }],
    });

    expect(message).toContain('1. Signed in, on order 1042');
    expect(message).toContain('report step 1 passed');
    expect(message).toContain('report step 1 blocked');
    expect(message).toContain('- Download the invoice\n- Open the PDF');
    expect(message).toContain('Portuguese');
    expect(message).toContain('${SHOP_EMAIL}');
    expect(message).toContain('heading "Shop"');
  });

  it('has nothing to prepare for a case with no preconditions', () => {
    expect(
      describePrep({
        steps: [{ ...STEP, casePreconditions: '  ' }],
        screen: '',
        language: 'en',
        variables: [],
      }),
    ).toBe('This case has nothing to prepare. End your turn.');
  });
});
