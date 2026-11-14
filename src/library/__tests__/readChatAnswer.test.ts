import { describe, expect, it } from 'vitest';
import { readChatAnswer } from '@/library';

const CASE = {
  title: 'Checkout with a test card',
  priority: 'P1',
  goal: 'A card order goes through.',
  preconditions: 'One product in the cart.',
  steps: [{ action: 'Pay', expected: 'A confirmation appears' }],
};

const QUESTION = {
  header: 'Scope',
  question: 'What should the plan cover?',
  options: [
    { label: 'The checkout', description: 'From the cart to the receipt.' },
    { label: 'The whole shop', description: 'Every flow a buyer takes.' },
  ],
  multiSelect: false,
};

describe('readChatAnswer', () => {
  it('reads a reply with no plan', () => {
    expect(readChatAnswer(JSON.stringify({ reply: '  1 + 1 is 2. ' }))).toEqual({
      reply: '1 + 1 is 2.',
      questions: [],
      plan: null,
    });
  });

  /**
   * O Haiku perguntou e mandou junto `plan: { summary: '', cases: [] }` no lugar de null: a
   * página o tomava como um plano de zero casos, que trocava o plano do workspace.
   */
  it('reads a plan with no cases as no plan, keeping the questions', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'I walked the app.',
        questions: [QUESTION],
        plan: { summary: '', cases: [] },
      }),
    );

    expect(answer?.plan).toBeNull();
    expect(answer?.questions).toHaveLength(1);
  });

  it('reads a reply with the plan the QA asked for', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'One case.',
        plan: { summary: 'One case.', cases: [CASE] },
      }),
    );

    expect(answer?.plan?.cases).toEqual([{ ...CASE, sources: [] }]);
  });

  it('keeps the id of a case the agent kept, so its runs and bugs stay with it', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'Changed TC-03.',
        plan: { summary: '', cases: [{ ...CASE, id: 'TC-03' }] },
      }),
    );

    expect(answer?.plan?.cases[0]?.id).toBe('TC-03');
  });

  it('reads a new case in strict mode, where Codex writes its missing id as null', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'Added one.',
        plan: { summary: '', cases: [{ ...CASE, id: null }] },
      }),
    );

    expect(answer?.plan?.cases).toHaveLength(1);
    expect(answer?.plan?.cases[0]?.id).toBeUndefined();
  });

  it('keeps the Figma node a step’s screen should match, and drops the null Codex writes for none', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'Against the design.',
        plan: {
          summary: '',
          cases: [
            {
              ...CASE,
              id: null,
              steps: [
                { action: 'Open the cart', expected: 'The cart', frame: '12:345' },
                { action: 'Pay', expected: 'A confirmation appears', frame: null },
              ],
            },
          ],
        },
      }),
    );

    expect(answer?.plan?.cases[0]?.steps).toEqual([
      { action: 'Open the cart', expected: 'The cart', frame: '12:345' },
      { action: 'Pay', expected: 'A confirmation appears' },
    ]);
  });

  /**
   * O schema pede de onde vem o esperado em todo caso, mas um caso que veio sem a lista,
   * ou com o null do Codex, não pode derrubar o plano inteiro.
   */
  it('keeps where each case came from, and reads a case with no list as from nowhere', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'Two cases from the story.',
        plan: {
          summary: 'Two cases.',
          cases: [{ ...CASE, sources: ['C1', 'qa'] }, { ...CASE, sources: null }, CASE],
        },
      }),
    );

    expect(answer?.plan?.cases.map(({ sources }) => sources)).toEqual([
      ['C1', 'qa'],
      [],
      [],
    ]);
  });

  it('keeps the strategy of a plan, and reads a plan the agent wrote without one', () => {
    const strategy = {
      covers: 'Coupons at checkout',
      leavesOut: 'The admin',
      where: 'Staging, web',
      data: 'A valid and an expired coupon',
      risks: 'Stacking',
    };
    const planOf = (extra: Record<string, unknown>) =>
      readChatAnswer(
        JSON.stringify({
          reply: 'One case.',
          plan: { summary: 'One case.', cases: [CASE], ...extra },
        }),
      )?.plan;

    expect(planOf({ strategy })?.strategy).toEqual(strategy);
    expect(planOf({})?.cases).toHaveLength(1);
    expect(planOf({ strategy: null })?.strategy).toBeUndefined();
  });

  it('reads the questions the agent puts to the QA', () => {
    const answer = readChatAnswer(
      JSON.stringify({ reply: 'Two things first.', questions: [QUESTION] }),
    );

    expect(answer?.questions).toEqual([
      {
        header: 'Scope',
        question: 'What should the plan cover?',
        options: QUESTION.options,
        isMultiSelect: false,
      },
    ]);
  });

  it('keeps the reply when the plan breaks the schema, and drops only the plan', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'Here it is.',
        questions: [QUESTION],
        plan: { summary: 'x', cases: [{ ...CASE, priority: 'urgent' }] },
      }),
    );

    expect(answer).toMatchObject({ reply: 'Here it is.', plan: null });
    expect(answer?.questions).toHaveLength(1);
  });

  it('drops a round with a question that offers nothing to pick, and keeps the rest', () => {
    const answer = readChatAnswer(
      JSON.stringify({
        reply: 'Here it is.',
        questions: [{ ...QUESTION, options: [] }],
        plan: { summary: 'One case.', cases: [CASE] },
      }),
    );

    expect(answer?.questions).toEqual([]);
    expect(answer?.plan?.cases).toEqual([{ ...CASE, sources: [] }]);
  });

  it('reads the nulls Codex sends for what it left out', () => {
    expect(
      readChatAnswer(JSON.stringify({ reply: 'Hi.', questions: null, plan: null })),
    ).toEqual({ reply: 'Hi.', questions: [], plan: null });
  });

  it('takes prose the agent printed instead of JSON as the reply', () => {
    expect(readChatAnswer('I could not reach the page.')).toEqual({
      reply: 'I could not reach the page.',
      questions: [],
      plan: null,
    });
  });

  it('gives nothing for JSON that is not a chat answer, or for nothing at all', () => {
    expect(readChatAnswer(JSON.stringify({ verdict: 'passed' }))).toBeNull();
    expect(readChatAnswer('   ')).toBeNull();
  });
  describe('an option that creates variables', () => {
    const ACCOUNT = {
      header: 'Account',
      question: 'Which account should the plan sign in with?',
      options: [
        { label: 'LOGIN_EMAIL', description: 'The admin the project keeps.' },
        {
          label: 'A new account',
          description: 'Opens a window to type it.',
          variables: [
            { name: 'SELLER_EMAIL', description: 'A seller on staging' },
            { name: 'SELLER_PASSWORD', description: 'Its password' },
          ],
        },
      ],
      multiSelect: false,
    };

    it('keeps the variables an option would create, and none on the others', () => {
      const [question] =
        readChatAnswer(JSON.stringify({ reply: 'Which account?', questions: [ACCOUNT] }))
          ?.questions ?? [];

      expect(question?.options).toEqual(ACCOUNT.options);
    });

    it('reads the nulls Codex writes on the options that create nothing', () => {
      const [question] =
        readChatAnswer(
          JSON.stringify({
            reply: 'Which account?',
            questions: [
              {
                ...ACCOUNT,
                options: [{ ...ACCOUNT.options[0], variables: null }, ACCOUNT.options[1]],
              },
            ],
          }),
        )?.questions ?? [];

      expect(question?.options).toEqual(ACCOUNT.options);
    });
  });

  it('keeps the app’s name the agent read, trimmed, and nothing for an empty one', () => {
    expect(
      readChatAnswer(JSON.stringify({ reply: 'Ok.', projectName: '  Loja Online ' }))
        ?.projectName,
    ).toBe('Loja Online');
    expect(
      readChatAnswer(JSON.stringify({ reply: 'Ok.', projectName: ' ' })),
    ).not.toHaveProperty('projectName');
    expect(
      readChatAnswer(JSON.stringify({ reply: 'Ok.', projectName: 'x'.repeat(61) })),
    ).not.toHaveProperty('projectName');
  });
});
