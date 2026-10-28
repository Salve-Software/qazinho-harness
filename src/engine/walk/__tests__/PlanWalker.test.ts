import type { IFlatStep, IRecipeBook, IStepAction } from '@/contract';
import type { IDeviceDriver } from '@/engine/devices/types';
import type {
  CaseTurnEnd,
  ICaseAgent,
  ICaseTurn,
  WalkEvent,
  WalkMode,
} from '@/engine/walk/types';
import type { IStepReport } from '@/tools/servers/device/types';
import { describe, expect, it } from 'vitest';
import { fingerprintOf, PlanWalker, UNWALKED } from '@/engine/walk';
import { Harness } from '@/Harness.class';

/** Two cases of two steps each, as a run flattens them. */
const STEPS: IFlatStep[] = [
  ['cart', 1, 'Open the cart', 'The cart shows 2 items'],
  ['cart', 2, 'Tap Pay with Pix', 'The Pix code shows'],
  ['login', 1, 'Open the login', 'The login form shows'],
  ['login', 2, 'Sign in as ${USER}', 'The account page shows'],
].map(([caseId, numberInCase, action, expected]) => ({
  caseId: String(caseId),
  caseTitle: `Case ${String(caseId)}`,
  casePriority: 'P1',
  caseGoal: '',
  casePreconditions: '',
  numberInCase: Number(numberInCase),
  action: String(action),
  expected: String(expected),
}));

const NO_RECORDINGS: IRecipeBook = { cases: [] };

/** A device that shows whatever the test says, keeps every action and screenshot, and counts how often the app was opened anew. */
function fakeDevice(screen: { text: string }) {
  const acted: IStepAction[] = [];
  const shots: string[] = [];
  let restarts = 0;
  const driver: IDeviceDriver = {
    open: () => Promise.resolve(),
    restart: () => {
      restarts += 1;

      return Promise.resolve();
    },
    act: (action) => {
      acted.push(action);

      return Promise.resolve();
    },
    describe: () => Promise.resolve(screen.text),
    inspect: () => Promise.resolve(''),
    glance: () => Promise.resolve(null),
    motion: () => Promise.resolve(null),
    resize: () => Promise.resolve(),
    focus: () => Promise.resolve(),
    shoot: (file) => {
      shots.push(file);

      return Promise.resolve({ file, dataUrl: 'data:image/jpeg;base64,' });
    },
    stream: () => Promise.resolve(false),
    record: () => Promise.resolve(false),
    stopRecording: () => Promise.resolve(null),
    close: () => Promise.resolve(),
  };

  return { driver, acted, shots, restarts: () => restarts };
}

const report = (step: number, overrides: Partial<IStepReport> = {}): IStepReport => ({
  step,
  verdict: 'passed',
  why: '',
  got: '',
  title: '',
  severity: 'medium',
  note: '',
  proof: `Proof ${String(step)}`,
  ...overrides,
});

/** An agent whose every turn plays what the test wrote for its case, through the device tools' callbacks, and ends as the test says. */
function fakeAgent(
  play: (turn: ICaseTurn) => Promise<CaseTurnEnd | undefined>,
): ICaseAgent & { turns: ICaseTurn[]; cancels: number } {
  const agent = {
    turns: [] as ICaseTurn[],
    cancels: 0,
    walk: async (turn: ICaseTurn) => {
      agent.turns.push(turn);

      return (await play(turn)) ?? { kind: 'ended' as const, costUsd: 0.01 };
    },
    cancel: () => {
      agent.cancels += 1;
    },
  };

  return agent;
}

/** An agent that clicks the step's action and reports each step it is told to, passing. */
const passingAgent = () =>
  fakeAgent(async (turn) => {
    for (const step of [1, 2]) {
      await turn.device.driver.act({
        kind: 'click',
        target: `Step ${String(step)}`,
        value: '',
      });
      await turn.device.onReport?.(report(step));
    }

    return undefined;
  });

async function walkWith(props: {
  agent: ICaseAgent | null;
  mode?: WalkMode;
  book?: IRecipeBook;
  screen?: { text: string };
  steps?: IFlatStep[];
}) {
  const device = fakeDevice(props.screen ?? { text: 'Proof 1 Proof 2' });
  const events: WalkEvent[] = [];
  const walker = new PlanWalker({
    scope: 'plan-1',
    runId: 'run-1',
    driver: device.driver,
    agent: props.agent,
    harness: new Harness(),
    target: { kind: 'web', value: 'https://loja.test' },
    viewport: { width: 1280, height: 800 },
    language: 'en',
    values: [{ name: 'USER', description: 'The test account', value: 'ana@loja.test' }],
    bugs: [],
    shotDir: '/runs/run-1',
    onEvent: (event) => {
      events.push(event);
    },
  });
  const ended = await walker.walk({
    steps: props.steps ?? STEPS,
    mode: props.mode ?? 'plan',
    book: props.book ?? NO_RECORDINGS,
  });
  const steps = events.flatMap((event) =>
    event.kind === 'step'
      ? [
          [
            event.outcome.caseId,
            event.outcome.stepNumber,
            event.outcome.verdict,
            event.outcome.by ?? 'agent',
          ],
        ]
      : [],
  );

  return { ended, events, steps, device };
}

const bookWithCart = (proof: string): IRecipeBook => ({
  cases: [
    {
      caseId: 'cart',
      fingerprint: fingerprintOf({ targetKind: 'web', steps: STEPS.slice(0, 2) }),
      targetKind: 'web',
      steps: [
        { number: 1, actions: [{ kind: 'click', target: 'Cart', value: '' }], proof },
        { number: 2, actions: [{ kind: 'click', target: 'Pix', value: '' }], proof },
      ],
      runId: 'run-0',
      recordedAt: 0,
    },
  ],
});

describe('PlanWalker', () => {
  it('walks a case its recording holds with no agent, and hands the rest to the agent', async () => {
    const agent = passingAgent();
    const { steps, device } = await walkWith({
      agent,
      book: bookWithCart('Proof 1'),
    });

    expect(steps).toEqual([
      ['cart', 1, 'passed', 'replay'],
      ['cart', 2, 'passed', 'replay'],
      ['login', 1, 'passed', 'agent'],
      ['login', 2, 'passed', 'agent'],
    ]);
    expect(agent.turns.map((turn) => turn.prompt.includes('Open the login'))).toEqual([
      true,
    ]);
    expect(device.acted.slice(0, 2).map(({ target }) => target)).toEqual(['Cart', 'Pix']);
  });

  it('keeps a case the agent passed with its proofs as a recording, its variable by name', async () => {
    const agent = fakeAgent(async (turn) => {
      await turn.device.driver.act({ kind: 'fill', target: 'E-mail', value: '${USER}' });
      await turn.device.onReport?.(report(1));
      await turn.device.onReport?.(report(2));

      return undefined;
    });
    const { ended } = await walkWith({ agent, steps: STEPS.slice(2) });

    expect(ended.failure).toBeNull();
    expect(ended.recorded).toMatchObject([
      {
        caseId: 'login',
        runId: 'run-1',
        steps: [
          { number: 1, actions: [{ kind: 'fill', value: '${USER}' }], proof: 'Proof 1' },
          { number: 2, actions: [], proof: 'Proof 2' },
        ],
      },
    ]);
  });

  it('keeps in the proof each value the step expects that the screen showed and the agent left out', async () => {
    const agent = fakeAgent(async (turn) => {
      await turn.device.onReport?.(report(1, { proof: '1 item: Caneca' }));
      await turn.device.onReport?.(report(2, { proof: 'Pix' }));

      return undefined;
    });
    const steps: IFlatStep[] = [
      { ...STEPS[0]!, expected: 'The cart shows 1 item and the total R$ 30,00' },
      { ...STEPS[1]!, expected: 'The Pix code shows' },
    ];
    const { ended } = await walkWith({
      agent,
      steps,
      screen: { text: 'Cart 1 item: Caneca Total: R$ 30,00 Pix' },
    });

    expect(ended.recorded[0]?.steps.map(({ proof }) => proof)).toEqual([
      '1 item: Caneca\nR$ 30,00',
      'Pix',
    ]);
  });

  it('heals a case whose recording no longer shows its proof, on the app opened anew', async () => {
    const agent = passingAgent();
    const { steps, device } = await walkWith({
      agent,
      book: bookWithCart('Proof that is gone'),
      steps: STEPS.slice(0, 2),
    });

    expect(steps).toEqual([
      ['cart', 1, 'passed', 'healed'],
      ['cart', 2, 'passed', 'healed'],
    ]);
    expect(device.restarts()).toBe(1);
  });

  it('does NOT ask the agent in a run of recordings alone: a case with none is skipped', async () => {
    const agent = passingAgent();
    const { steps, events } = await walkWith({
      agent,
      mode: 'recorded',
      book: bookWithCart('Proof 1'),
    });

    expect(agent.turns).toHaveLength(0);
    expect(steps.slice(2)).toEqual([
      ['login', 1, 'skipped', 'agent'],
      ['login', 2, 'skipped', 'agent'],
    ]);
    expect(
      events.find((event) => event.kind === 'step' && event.outcome.caseId === 'login'),
    ).toMatchObject({ outcome: { why: UNWALKED.noAgent } });
  });

  it('skips the rest of a case once a step fails, and goes on to the next case anew', async () => {
    const agent = fakeAgent(async (turn) => {
      await turn.device.onReport?.(
        turn.prompt.includes('Open the cart')
          ? report(1, {
              verdict: 'failed',
              why: 'The cart is empty',
              title: 'Empty cart',
            })
          : report(1),
      );
      await turn.device.onReport?.(report(2));

      return undefined;
    });
    const { steps, device } = await walkWith({ agent });

    expect(steps).toEqual([
      ['cart', 1, 'failed', 'agent'],
      ['cart', 2, 'skipped', 'agent'],
      ['login', 1, 'passed', 'agent'],
      ['login', 2, 'passed', 'agent'],
    ]);
    expect(device.restarts()).toBe(1);
    expect(agent.turns[1]?.prompt).toContain('Empty cart');
  });

  it('skips what is left once the run spent all it may on the model, walking recordings still', async () => {
    const agent = fakeAgent(() => Promise.resolve({ kind: 'capped', costUsd: 0.2 }));
    const { steps, events } = await walkWith({ agent, book: NO_RECORDINGS });

    expect(agent.turns).toHaveLength(1);
    expect(steps.map(([, , verdict]) => verdict)).toEqual([
      'skipped',
      'skipped',
      'skipped',
      'skipped',
    ]);
    expect(events).toContainEqual({ kind: 'cost', costUsd: 0.2 });
    expect(
      events.filter(
        (event) => event.kind === 'step' && event.outcome.why === UNWALKED.capped,
      ),
    ).toHaveLength(2);
  });

  it('breaks off with why when the agent could not walk a case', async () => {
    const agent = fakeAgent(() =>
      Promise.resolve({
        kind: 'failed',
        reason: 'The model did not answer.',
        costUsd: null,
      }),
    );
    const { ended, steps } = await walkWith({ agent });

    expect(ended.failure).toBe('The model did not answer.');
    expect(steps).toEqual([
      ['cart', 1, 'blocked', 'agent'],
      ['cart', 2, 'skipped', 'agent'],
    ]);
  });

  it('ends a case skipped with its question when the agent needs the QA, since no one answers', async () => {
    const agent = fakeAgent(async (turn) => {
      const said = await turn.device.onAsk?.({
        question: 'Which code did the phone get?',
        options: [],
        secret: null,
      });

      expect(said).toContain('No one answers');

      return undefined;
    });
    const { events } = await walkWith({ agent, steps: STEPS.slice(0, 2) });

    expect(events).toContainEqual(
      expect.objectContaining({
        kind: 'step',
        outcome: expect.objectContaining({
          stepNumber: 1,
          verdict: 'skipped',
          why: `${UNWALKED.asked} Which code did the phone get?`,
        }) as unknown,
      }),
    );
    await new Promise((settle) => setImmediate(settle));

    expect(agent.cancels).toBe(1);
  });

  it('blocks the first step the agent left unreported when its turn ended', async () => {
    const agent = fakeAgent(async (turn) => {
      await turn.device.onReport?.(report(1));

      return undefined;
    });
    const { steps, events } = await walkWith({ agent, steps: STEPS.slice(0, 2) });

    expect(steps).toEqual([
      ['cart', 1, 'passed', 'agent'],
      ['cart', 2, 'blocked', 'agent'],
    ]);
    expect(events).toContainEqual({ kind: 'cost', costUsd: 0.01 });
  });

  it('files a bug seen beside a step with the step it was walking and its screen', async () => {
    const agent = fakeAgent(async (turn) => {
      await turn.device.onFinding?.({
        title: 'Total shows twice',
        severity: 'low',
        expected: 'One total',
        got: 'Two totals',
      });
      await turn.device.onReport?.(report(1));
      await turn.device.onReport?.(report(2));

      return undefined;
    });
    const { events } = await walkWith({ agent, steps: STEPS.slice(0, 2) });

    expect(events).toContainEqual({
      kind: 'finding',
      finding: expect.objectContaining({
        title: 'Total shows twice',
        caseId: 'cart',
        stepNumber: 1,
        shotFile: '/runs/run-1/finding-1-1.jpg',
      }) as unknown,
    });
  });
});
