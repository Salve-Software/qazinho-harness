import type { IRecipeBook, ISignInRecipe, IStepAction } from '@/contract';
import type { IDeviceDriver, IWebSession } from '@/engine/devices/types';
import type { IDevicePort } from '@/tools/servers/device/types';
import { describe, expect, it, vi } from 'vitest';
import { SessionKeeper, withSignIn } from '@/engine/walk';

const SESSION: IWebSession = {
  cookies: [
    {
      name: 'sid',
      value: 'abc',
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ],
  origins: [],
};

const SIGN_IN: ISignInRecipe = {
  account: 'LOGIN_EMAIL',
  actions: [
    { kind: 'fill', target: 'E-mail', value: '${LOGIN_EMAIL}' },
    { kind: 'click', target: 'Entrar', value: '' },
  ],
  proof: 'Sair',
};

/**
 * Um navegador falso: a tela diz "Sair" depois de entrar, ou depois de uma sessão que
 * vale; `holds` diz se a sessão guardada ainda põe o app dentro da conta.
 */
function fakeBrowser(props: { holds: boolean }) {
  const restarts: (IWebSession | undefined)[] = [];
  const acted: IStepAction[] = [];
  let isIn = false;
  const driver: IDeviceDriver = {
    open: () => Promise.resolve(),
    restart: (session) => {
      restarts.push(session);
      isIn = session !== undefined && props.holds;

      return Promise.resolve();
    },
    act: () => Promise.resolve(),
    describe: () => Promise.resolve(isIn ? 'Olá, Ana · Sair' : 'Entrar'),
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
  const port: IDevicePort = {
    describe: () => driver.describe(),
    inspect: () => Promise.resolve(''),
    failedCalls: () => Promise.resolve([]),
    calls: () => Promise.resolve(''),
    glance: () => Promise.resolve(null),
    act: (action) => {
      acted.push(action);

      if (action.kind === 'click' && action.target === 'Entrar') isIn = true;

      return Promise.resolve();
    },
  };

  return {
    driver,
    port,
    restarts,
    acted,
    signInBy: () => {
      isIn = true;
    },
  };
}

const recorded = (signIn: ISignInRecipe): IRecipeBook => ({
  cases: [
    withSignIn({
      recipe: {
        caseId: 'TC-01',
        fingerprint: 'f',
        targetKind: 'web',
        steps: [{ number: 1, actions: [], proof: 'Carrinho' }],
        runId: 'r-1',
        recordedAt: 1,
      },
      signIn,
    }),
  ],
});

function keeperOf(props: {
  browser: ReturnType<typeof fakeBrowser>;
  book?: IRecipeBook;
  agent?: ISignInRecipe | null;
}) {
  const signIn = vi.fn((account: string) => {
    if (props.agent === null) return Promise.resolve(null);

    props.browser.signInBy();

    return Promise.resolve(props.agent ?? { ...SIGN_IN, account });
  });
  const keeper = new SessionKeeper({
    driver: props.browser.driver,
    port: props.browser.port,
    book: props.book ?? { cases: [] },
    appUrl: 'http://localhost:4400/',
    signIn,
    isStopped: () => false,
  });

  return { keeper, signIn };
}

describe('SessionKeeper.start', () => {
  it('signs in once with the agent, then starts the next case with the kept session', async () => {
    const browser = fakeBrowser({ holds: true });
    const { keeper, signIn } = keeperOf({ browser });

    expect(await keeper.start({ account: 'LOGIN_EMAIL', isFresh: true })).toBe(true);
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(browser.restarts).toEqual([]);
    expect(browser.acted.at(-1)).toMatchObject({
      kind: 'goto',
      target: 'http://localhost:4400/',
    });

    expect(await keeper.start({ account: 'LOGIN_EMAIL', isFresh: false })).toBe(true);
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(browser.restarts).toEqual([SESSION]);
  });

  it('signs in from a recording without the agent when one holds', async () => {
    const browser = fakeBrowser({ holds: true });
    const { keeper, signIn } = keeperOf({ browser, book: recorded(SIGN_IN) });

    expect(await keeper.start({ account: 'LOGIN_EMAIL', isFresh: true })).toBe(true);
    expect(signIn).not.toHaveBeenCalled();
    expect(browser.acted.slice(0, 2)).toEqual(SIGN_IN.actions);
    expect(keeper.signInOf('LOGIN_EMAIL')).toEqual(SIGN_IN);
  });

  it('asks the agent again when the recorded sign-in no longer gets in', async () => {
    const browser = fakeBrowser({ holds: true });
    const stale: ISignInRecipe = {
      ...SIGN_IN,
      actions: [{ kind: 'click', target: 'Login', value: '' }],
    };
    const { keeper, signIn } = keeperOf({ browser, book: recorded(stale) });

    vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] });

    try {
      const started = keeper.start({ account: 'LOGIN_EMAIL', isFresh: true });

      await vi.runAllTimersAsync();
      expect(await started).toBe(true);
      expect(signIn).toHaveBeenCalledTimes(1);
      expect(browser.restarts).toEqual([undefined]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('signs in again in every case when the kept session does not hold, without the agent', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] });

    try {
      const browser = fakeBrowser({ holds: false });
      const { keeper, signIn } = keeperOf({ browser, agent: SIGN_IN });

      expect(await keeper.start({ account: 'LOGIN_EMAIL', isFresh: true })).toBe(true);

      const second = keeper.start({ account: 'LOGIN_EMAIL', isFresh: false });

      await vi.runAllTimersAsync();
      expect(await second).toBe(true);
      expect(browser.restarts).toEqual([SESSION, undefined]);

      expect(await keeper.start({ account: 'LOGIN_EMAIL', isFresh: false })).toBe(true);
      expect(browser.restarts).toEqual([SESSION, undefined, undefined]);
      expect(signIn).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('is false when no one could sign in', async () => {
    const browser = fakeBrowser({ holds: true });
    const { keeper } = keeperOf({ browser, agent: null });

    expect(await keeper.start({ account: 'LOGIN_EMAIL', isFresh: true })).toBe(false);
    expect(keeper.signInOf('LOGIN_EMAIL')).toBeNull();
  });
});
