import type { IFlatStep, IRecipeBook } from '@/contract';
import type { IDeviceDriver, IWebSession } from '@/engine/devices/types';
import type { ICaseAgent, ICaseTurn, WalkEvent, WalkMode } from '@/engine/walk/types';
import { describe, expect, it } from 'vitest';
import { PlanWalker, UNWALKED } from '@/engine/walk';
import { Harness } from '@/Harness.class';

/** Dois casos web que começam logados na conta ${USER}, um passo cada. */
const STEPS: IFlatStep[] = ['cart', 'orders'].map((caseId) => ({
  caseId,
  caseTitle: `Case ${caseId}`,
  casePriority: 'P1',
  caseGoal: '',
  casePreconditions: 'Logado como ${USER}',
  caseSignedInAs: 'USER',
  numberInCase: 1,
  action: `Open the ${caseId}`,
  expected: 'It shows',
}));

const SESSION: IWebSession = { cookies: [], origins: [] };

/** Um navegador que mostra "Sair" dentro da conta, e cuja sessão guardada vale. */
function fakeBrowser() {
  const restarts: (IWebSession | undefined)[] = [];
  let isIn = false;
  const driver: IDeviceDriver = {
    open: () => Promise.resolve(),
    restart: (session) => {
      restarts.push(session);
      isIn = session !== undefined;

      return Promise.resolve();
    },
    act: (action) => {
      if (action.target === 'Entrar') isIn = true;

      return Promise.resolve();
    },
    describe: () => Promise.resolve(`${isIn ? 'Sair' : 'Entrar'} · Proof`),
    inspect: () => Promise.resolve(''),
    glance: () => Promise.resolve(null),
    resize: () => Promise.resolve(),
    focus: () => Promise.resolve(),
    shoot: () => Promise.resolve(null),
    stream: () => Promise.resolve(false),
    record: () => Promise.resolve(false),
    stopRecording: () => Promise.resolve(null),
    close: () => Promise.resolve(),
    sessionState: () => Promise.resolve(SESSION),
  };

  return { driver, restarts };
}

/** Um agente que entra quando pedem e passa cada caso com a prova que a tela mostra. */
function fakeAgent(): ICaseAgent & { turns: ICaseTurn[] } {
  const agent = {
    turns: [] as ICaseTurn[],
    walk: async (turn: ICaseTurn) => {
      agent.turns.push(turn);

      const isSignIn = turn.prompt.startsWith('Sign in to the app');

      await turn.device.driver.act({
        kind: 'click',
        target: isSignIn ? 'Entrar' : 'Open',
        value: '',
      });
      await turn.device.onReport?.({
        step: 1,
        verdict: 'passed',
        why: '',
        got: '',
        title: '',
        severity: 'medium',
        goesOn: false,
        note: '',
        proof: isSignIn ? 'Sair' : 'Proof',
      });

      return { kind: 'ended' as const, costUsd: 0.01 };
    },
    cancel: () => undefined,
  };

  return agent;
}

async function walkWith(props: {
  agent: ICaseAgent | null;
  mode?: WalkMode;
  book?: IRecipeBook;
  targetKind?: 'web' | 'android';
}) {
  const browser = fakeBrowser();
  const events: WalkEvent[] = [];
  const walker = new PlanWalker({
    scope: 'plan-1',
    runId: 'run-1',
    driver: browser.driver,
    agent: props.agent,
    harness: new Harness(),
    target: { kind: props.targetKind ?? 'web', value: 'https://loja.test' },
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
    steps: STEPS,
    mode: props.mode ?? 'plan',
    book: props.book ?? { cases: [] },
  });

  return { ended, events, browser };
}

describe('PlanWalker with cases that start signed in', () => {
  it('signs in once, starts the next case with the session, and records how it signed in', async () => {
    const agent = fakeAgent();
    const { ended, browser } = await walkWith({ agent });

    expect(agent.turns.map(({ prompt }) => prompt.split('\n')[0])).toEqual([
      'Sign in to the app with the account ${USER}, and do nothing else: the cases of this plan start inside it.',
      'cart · Case cart',
      'orders · Case orders',
    ]);
    expect(agent.turns[1]?.prompt).toContain('You start signed in as ${USER}');
    expect(browser.restarts).toEqual([SESSION]);
    expect(ended.recorded.map(({ steps }) => steps[0]?.signIn?.account)).toEqual([
      'USER',
      'USER',
    ]);
    expect(ended.recorded[0]?.steps[0]?.signIn?.actions).toEqual([
      { kind: 'click', target: 'Entrar', value: '' },
    ]);
  });

  it('blocks a case it cannot sign in for, with no agent and no recorded sign-in', async () => {
    const { events } = await walkWith({ agent: null, mode: 'recorded' });
    const outcomes = events.flatMap((event) =>
      event.kind === 'step' ? [event.outcome] : [],
    );

    expect(outcomes.map(({ verdict, why }) => [verdict, why])).toEqual([
      ['blocked', `${UNWALKED.signIn} \${USER}`],
      ['blocked', `${UNWALKED.signIn} \${USER}`],
    ]);
  });

  it('leaves a phone alone: it signs in again in every case, as the case says', async () => {
    const agent = fakeAgent();
    const { browser } = await walkWith({ agent, targetKind: 'android' });

    expect(agent.turns.map(({ prompt }) => prompt.split('\n')[0])).toEqual([
      'cart · Case cart',
      'orders · Case orders',
    ]);
    expect(agent.turns[0]?.prompt).not.toContain('You start signed in');
    expect(browser.restarts).toEqual([undefined]);
  });
});
