import type { ISessionKeeper } from './types';
import type { IRecipeBook, ISignInRecipe } from '@/contract';
import type { IDeviceDriver, IWebSession } from '@/engine/devices/types';
import type { IDevicePort } from '@/tools/servers/device/types';
import { SESSION_KEEPER } from './constants';
import { proofHolds, signInFor } from './library';

/**
 * Guarda, numa run web, a sessão de cada conta em que um caso começa logado: entra uma
 * vez por conta e começa os casos seguintes já dentro dela.
 */
export class SessionKeeper {
  private readonly driver: IDeviceDriver;
  private readonly port: IDevicePort;
  private readonly book: IRecipeBook;
  private readonly appUrl: string;
  private readonly signIn: ISessionKeeper['signIn'];
  private readonly isStopped: () => boolean;
  private readonly kept = new Map<
    string,
    { session: IWebSession | null; signIn: ISignInRecipe }
  >();
  private readonly unkept = new Set<string>();

  public constructor(props: ISessionKeeper) {
    this.driver = props.driver;
    this.port = props.port;
    this.book = props.book;
    this.appUrl = props.appUrl;
    this.signIn = props.signIn;
    this.isStopped = props.isStopped;
  }

  /**
   * Abre o app no começo de um caso, já dentro da conta: com a sessão guardada, senão
   * entrando pela gravação ou pelo agente; false quando não deu para entrar.
   */
  public async start(props: { account: string; isFresh: boolean }): Promise<boolean> {
    const { account } = props;
    const held = this.kept.get(account);

    if (held !== undefined && held.session !== null && !this.unkept.has(account)) {
      await this.driver.restart(held.session).catch(() => undefined);

      if (await this.shows(held.signIn.proof)) return true;

      this.unkept.add(account);
    }

    if (!props.isFresh || held !== undefined)
      await this.driver.restart().catch(() => undefined);

    const recorded = held?.signIn ?? signInFor({ book: this.book, account });
    const signed =
      recorded !== null && (await this.replay(recorded))
        ? recorded
        : await this.signInAnew({ account, wasTried: recorded !== null });

    if (signed === null) return false;

    const session = this.unkept.has(account)
      ? null
      : ((await this.driver.sessionState?.().catch(() => null)) ?? null);

    this.kept.set(account, { session, signIn: signed });
    await this.port
      .act({ kind: 'goto', target: this.appUrl, value: '' })
      .catch(() => undefined);

    return true;
  }

  /** Como a run entrou na conta, para a gravação de um caso que começou dentro dela. */
  public signInOf(account: string): ISignInRecipe | null {
    return this.kept.get(account)?.signIn ?? null;
  }

  private async signInAnew(props: {
    account: string;
    wasTried: boolean;
  }): Promise<ISignInRecipe | null> {
    if (this.isStopped()) return null;

    if (props.wasTried) await this.driver.restart().catch(() => undefined);

    return this.signIn(props.account);
  }

  private async replay(signIn: ISignInRecipe): Promise<boolean> {
    for (const action of signIn.actions) {
      if (this.isStopped()) return false;

      const isDone = await this.port.act(action).then(
        () => true,
        () => false,
      );

      if (!isDone) return false;
    }

    return this.shows(signIn.proof);
  }

  private async shows(proof: string): Promise<boolean> {
    const until = Date.now() + SESSION_KEEPER.proofWaitMs;

    for (;;) {
      const screen = await this.port.describe().catch(() => '');

      if (proofHolds({ screen, proof })) return true;

      if (Date.now() >= until || this.isStopped()) return false;

      await new Promise((wake) => setTimeout(wake, SESSION_KEEPER.pollMs));
    }
  }
}
