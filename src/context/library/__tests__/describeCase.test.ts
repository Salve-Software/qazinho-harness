import { describe, expect, it } from 'vitest';
import { describeCase } from '@/context/library';

const STEP = {
  caseId: 'TC-01',
  caseTitle: 'Sign in',
  casePriority: 'P1',
  caseGoal: '',
  casePreconditions: '',
  numberInCase: 1,
  action: 'Open the sign in page',
  expected: 'The form shows',
};

const DESIGN = {
  url: 'https://www.figma.com/design/AbC123/Shop?node-id=1-23',
  fileKey: 'AbC123',
  nodeId: '1:23',
  name: 'Shop',
};

describe('describeCase', () => {
  it('names the case and lists every step with what the QA expects', () => {
    expect(
      describeCase({
        steps: [
          STEP,
          {
            ...STEP,
            numberInCase: 2,
            action: 'Sign in',
            expected: 'The home page opens',
          },
        ],
        screen: '',
        language: 'en',
        filed: [],
        known: [],
        variables: [],
        design: null,
      }),
    ).toBe(
      [
        'TC-01 · Sign in',
        'Carry out these steps in order, and report each one as soon as you judged it:',
        '1. Open the sign in page',
        '   The QA expects: The form shows',
        '2. Sign in',
        '   The QA expects: The home page opens',
        'Write what you report and note in English, whatever language these steps are in.',
      ].join('\n'),
    );
  });

  it('says what the case is for and what it needs before step 1, so the agent sets it up', () => {
    expect(
      describeCase({
        steps: [
          {
            ...STEP,
            caseGoal: 'A member gets in.',
            casePreconditions: 'Account qa@shop.test, password Test-1234.',
          },
        ],
        screen: '',
        language: 'en',
        filed: [],
        known: [],
        variables: [],
        design: null,
      }),
    ).toBe(
      [
        'TC-01 · Sign in',
        'Goal: A member gets in.',
        'Preconditions: Account qa@shop.test, password Test-1234.',
        'Carry out these steps in order, and report each one as soon as you judged it:',
        '1. Open the sign in page',
        '   The QA expects: The form shows',
        'Write what you report and note in English, whatever language these steps are in.',
      ].join('\n'),
    );
  });

  /**
   * Um caso em português voltou com uma nota em inglês enquanto a regra ficava só no
   * system prompt, e um caso em português cheio de rótulos de um site em inglês voltou em
   * inglês enquanto esta linha pedia o idioma dos passos: agora ela nomeia o idioma que o
   * QA lê.
   */
  it('asks for the report in the language the QA reads, next to the steps', () => {
    expect(
      describeCase({
        steps: [STEP],
        screen: '',
        language: 'pt',
        filed: [],
        known: [],
        variables: [],
        design: null,
      }),
    ).toContain(
      'Write what you report and note in Brazilian Portuguese, whatever language these steps are in.',
    );
  });

  it('hands over the screen the case starts on, so the agent acts without looking first', () => {
    expect(
      describeCase({
        steps: [STEP],
        screen: 'Sign in · [button] Continue',
        language: 'en',
        filed: [],
        known: [],
        variables: [],
        design: null,
      }),
    ).toContain('The device shows right now:\nSign in · [button] Continue');
  });

  /**
   * Cada caso é um agente novo: sem isto, o QA era perguntado o e-mail da conta de teste
   * uma vez por caso.
   */
  it('hands over what the QA already answered in this run, so the case does not ask again', () => {
    const message = describeCase({
      steps: [STEP],
      screen: '',
      language: 'pt',
      filed: [],
      known: [],
      variables: [],
      design: null,
      told: [
        { question: 'Qual é o e-mail da conta de teste?', answer: 'ana@banco.test' },
      ],
    });

    expect(message).toContain(
      'What the QA already answered in this run, which holds for this case too: use it instead of asking again.\n- Qual é o e-mail da conta de teste?\n  ana@banco.test',
    );
    expect(
      describeCase({
        steps: [STEP],
        screen: '',
        language: 'pt',
        filed: [],
        known: [],
        variables: [],
        design: null,
      }),
    ).not.toContain('already answered');
  });

  it('lists the files the QA attached by name and path, and nothing when there are none', () => {
    const base = {
      steps: [STEP],
      screen: 'Sign in',
      language: 'en' as const,
      filed: [],
      known: [],
      variables: [],
      design: null,
    };

    expect(
      describeCase({
        ...base,
        uploads: [{ name: 'nota.pdf', path: '/data/w1/ab12cd34-nota.pdf' }],
      }),
    ).toContain(
      'Files of this plan, to pick with upload when a step needs one:\n- nota.pdf: /data/w1/ab12cd34-nota.pdf',
    );
    expect(describeCase(base)).not.toContain('Files of this plan');
    expect(describeCase({ ...base, uploadsAreSamples: true })).toContain(
      'upload with "paths" picks a sample of the same type under the same name',
    );
    expect(describeCase(base)).not.toContain('picks a sample of the same type');
  });

  it('tells the agent to stop at once when there is nothing to walk', () => {
    expect(
      describeCase({
        steps: [],
        screen: 'Home',
        language: 'en',
        filed: [],
        known: [],
        variables: [],
        design: null,
      }),
    ).toBe('This case has no steps. End your turn.');
  });

  /** O mesmo salto de layout foi aberto três vezes, uma pelo agente de cada caso. */
  it('lists the bugs the run already filed, so a later case does not file them again', () => {
    expect(
      describeCase({
        steps: [STEP],
        screen: '',
        language: 'en',
        filed: ['Home page jumps while loading', 'Yearly price differs'],
        known: [],
        variables: [],
        design: null,
      }),
    ).toContain(
      'Bugs this run already filed, not to file again; they have no id yet, so a step that fails for one is reported with its title:\n- Home page jumps while loading\n- Yearly price differs',
    );
  });

  /**
   * O mesmo bug do cupom voltou como BUG-03 numa run que não sabia que o BUG-01 estava
   * aberto.
   */
  it('lists the bugs already open in the workspace, with how to count one seen again', () => {
    expect(
      describeCase({
        steps: [STEP],
        screen: '',
        language: 'en',
        filed: [],
        known: [
          {
            id: 'BUG-01',
            title: 'An expired coupon is accepted',
            caseId: 'TC-03',
            stepNumber: 1,
            isIncidental: false,
          },
        ],
        variables: [],
        design: null,
      }),
    ).toContain(
      'Bugs already open in this workspace: when you see one of them again, give its id as "sameAs" instead of filing it anew.\n- BUG-01 · An expired coupon is accepted (TC-03, step 1)',
    );
  });

  it('lists nothing before the run filed anything', () => {
    expect(
      describeCase({
        steps: [STEP],
        screen: '',
        language: 'en',
        filed: [],
        known: [],
        variables: [],
        design: null,
      }),
    ).not.toContain('already filed');
  });

  it('names the design file and the frame each step’s screen should match', () => {
    const text = describeCase({
      steps: [
        { ...STEP, frame: '12:345' },
        { ...STEP, numberInCase: 2, action: 'Sign in', expected: 'Home' },
      ],
      screen: '',
      language: 'en',
      filed: [],
      known: [],
      variables: [],
      design: DESIGN,
    });

    expect(text).toContain(
      'Figma design: https://www.figma.com/design/AbC123/Shop?node-id=1-23 (fileKey AbC123). Hold each step that names a frame to it.',
    );
    expect(text).toContain(
      '1. Open the sign in page\n   The QA expects: The form shows\n   Its screen should match Figma frame 12:345.\n2. Sign in\n   The QA expects: Home\nWrite',
    );
  });

  it('says nothing of a design the workspace no longer has, nor of one no step names', () => {
    const framed = { ...STEP, frame: '12:345' };
    const base = {
      screen: '',
      language: 'en' as const,
      filed: [],
      known: [],
      variables: [],
    };

    expect(describeCase({ ...base, steps: [framed], design: null })).not.toContain(
      'Figma',
    );
    expect(describeCase({ ...base, steps: [STEP], design: DESIGN })).not.toContain(
      'Figma',
    );
  });

  it('lists the variables the case may type, by name and what each holds', () => {
    expect(
      describeCase({
        steps: [STEP],
        screen: '',
        language: 'en',
        filed: [],
        known: [],
        variables: [
          { name: 'LOGIN_EMAIL', description: 'The admin on staging' },
          { name: 'LOGIN_PASSWORD', description: '' },
        ],
        design: null,
      }),
    ).toContain(
      [
        '',
        'Variables the project keeps, to type as written:',
        '- ${LOGIN_EMAIL}: The admin on staging',
        '- ${LOGIN_PASSWORD}',
      ].join('\n'),
    );
  });
});
