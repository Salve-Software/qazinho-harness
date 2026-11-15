/**
 * A sessão de uma conta guardada entre casos, num Chrome de verdade: um app entra por
 * cookie e outro por localStorage. O driver entra uma vez, lê a sessão, e uma aba limpa
 * que a recebe já abre dentro da conta, sem nada a mais (um carrinho) do caso anterior.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtemp } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebDriver } from '@/engine/devices';

const PAGE = (body: string) => `<!doctype html><html><body>${body}</body></html>`;

/** Um app que entra por cookie: o servidor lê o cookie e escreve a tela. */
function cookieApp(request: IncomingMessage, response: ServerResponse) {
  const isIn = (request.headers.cookie ?? '').includes('sid=ana');

  if (request.url === '/entrar') {
    response.writeHead(302, { 'set-cookie': 'sid=ana; Path=/; HttpOnly', location: '/' });
    response.end();

    return;
  }

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(
    PAGE(
      isIn
        ? '<h1>Olá, Ana</h1><button>Sair</button>'
        : '<h1>Loja</h1><a href="/entrar">Entrar</a>',
    ),
  );
}

/** Um app que entra por localStorage: a página escreve a tela a partir do token. */
function storageApp(_: IncomingMessage, response: ServerResponse) {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(
    PAGE(`<h1 id="who">…</h1><p id="cart"></p><button id="enter">Entrar</button>
<script>
  const show = () => {
    const token = localStorage.getItem('token');
    document.getElementById('who').textContent = token ? 'Olá, ' + token : 'Loja';
    document.getElementById('enter').textContent = token ? 'Sair' : 'Entrar';
    document.getElementById('cart').textContent = sessionStorage.getItem('cart') ?? 'Carrinho vazio';
  };
  document.getElementById('enter').onclick = () => {
    localStorage.setItem('token', 'Bia');
    sessionStorage.setItem('cart', 'Carrinho com 2 itens');
    show();
  };
  show();
</script>`),
  );
}

const listen = (handle: (request: IncomingMessage, response: ServerResponse) => void) =>
  new Promise<{ url: string; close: () => void }>((ready) => {
    const server = createServer(handle);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      ready({ url: `http://127.0.0.1:${String(port)}/`, close: () => server.close() });
    });
  });

let apps: { cookie: string; storage: string } = { cookie: '', storage: '' };
let closers: (() => void)[] = [];

beforeAll(async () => {
  const cookie = await listen(cookieApp);
  const storage = await listen(storageApp);

  apps = { cookie: cookie.url, storage: storage.url };
  closers = [cookie.close, storage.close];
});

afterAll(() => {
  for (const close of closers) close();
});

async function driverOf(url: string) {
  const driver = new WebDriver({
    url,
    profileDir: await mkdtemp(join(tmpdir(), 'qz-session-')),
  });

  await driver.open();

  return driver;
}

describe('a kept session', () => {
  it('starts a clean tab inside the account an app keeps in a cookie', async () => {
    const driver = await driverOf(apps.cookie);

    try {
      await driver.act({ kind: 'click', target: 'Entrar', value: '' });
      expect(await driver.describe()).toContain('Olá, Ana');

      const session = await driver.sessionState();

      await driver.restart();
      expect(await driver.describe()).toContain('Entrar');

      await driver.restart(session ?? undefined);
      expect(await driver.describe()).toContain('Olá, Ana');
    } finally {
      await driver.close();
    }
  });

  it('starts a clean tab inside the account an app keeps in localStorage, without the last case left', async () => {
    const driver = await driverOf(apps.storage);

    try {
      await driver.act({ kind: 'click', target: 'Entrar', value: '' });

      const signedIn = await driver.describe();

      expect(signedIn).toContain('Olá, Bia');
      expect(signedIn).toContain('Carrinho com 2 itens');

      const session = await driver.sessionState();

      await driver.restart(session ?? undefined);

      const next = await driver.describe();

      expect(next).toContain('Olá, Bia');
      expect(next).toContain('Carrinho vazio');
      expect(driver.network().map(({ url }) => url)).not.toContain(
        `${apps.storage}?seeded`,
      );
    } finally {
      await driver.close();
    }
  });

  it('does NOT log the empty page that seeds the storage as a request of the app', async () => {
    const driver = await driverOf(apps.storage);

    try {
      await driver.act({ kind: 'click', target: 'Entrar', value: '' });

      const session = await driver.sessionState();
      const before = driver.network().length;

      await driver.restart(session ?? undefined);

      const documents = driver
        .network()
        .slice(before)
        .filter(({ type }) => type === 'document');

      expect(documents).toHaveLength(1);
    } finally {
      await driver.close();
    }
  });
});
