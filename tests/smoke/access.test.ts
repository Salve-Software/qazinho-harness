/**
 * A protected environment, walked for real on Chrome: the app's server asks for Vercel's bypass
 * header and a browser sign-in on every request, and a third-party server the page loads from
 * keeps what it was sent. The driver gets in with the project's variables, and the other origin
 * hears neither the secret nor the password.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtemp } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebDriver, webAccessOf } from '@/engine/devices';

const SECRET = 'bypass-s3cret';
const BASIC = `Basic ${Buffer.from('qa:senha').toString('base64')}`;
const seenByThirdParty: Record<string, string | undefined>[] = [];
let app = '';
let thirdParty = '';

const listen = (handle: (request: IncomingMessage, response: ServerResponse) => void) =>
  new Promise<{ url: string; close: () => void }>((ready) => {
    const server = createServer(handle);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      ready({ url: `http://127.0.0.1:${String(port)}`, close: () => server.close() });
    });
  });

let closers: (() => void)[] = [];

beforeAll(async () => {
  const other = await listen((request, response) => {
    seenByThirdParty.push({
      bypass: request.headers['x-vercel-protection-bypass'] as string | undefined,
      authorization: request.headers.authorization,
    });
    response.writeHead(200, { 'content-type': 'text/javascript' });
    response.end('window.thirdParty = true;');
  });
  thirdParty = other.url;
  const protectedApp = await listen((request, response) => {
    if (request.headers.authorization !== BASIC) {
      response.writeHead(401, { 'www-authenticate': 'Basic realm="staging"' });
      response.end('Sign in');

      return;
    }
    if (request.headers['x-vercel-protection-bypass'] !== SECRET) {
      response.writeHead(403, { 'content-type': 'text/html' });
      response.end('<h1>Vercel Authentication</h1>');

      return;
    }
    if (request.url === '/api/total') {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end('{"total":"R$ 42,00"}');

      return;
    }
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(`<!doctype html><html><body><h1>Loja de preview</h1><p id="total">…</p>
<script src="${thirdParty}/tag.js"></script>
<script>fetch('/api/total').then((a) => a.json()).then(({ total }) => {
  document.getElementById('total').textContent = 'Total ' + total;
});</script></body></html>`);
  });
  app = protectedApp.url;
  closers = [other.close, protectedApp.close];
});

afterAll(() => {
  for (const close of closers) close();
});

describe('a protected environment', () => {
  it("gets in with Vercel's bypass and the browser sign-in, which never leave the app's origin", async () => {
    const driver = new WebDriver({
      url: app,
      profileDir: await mkdtemp(join(tmpdir(), 'qz-access-')),
      access: webAccessOf([
        { name: 'VERCEL_AUTOMATION_BYPASS_SECRET', value: SECRET },
        { name: 'BASIC_AUTH_USER', value: 'qa' },
        { name: 'BASIC_AUTH_PASSWORD', value: 'senha' },
      ]),
    });

    await driver.open();
    await new Promise((settle) => setTimeout(settle, 800));
    const page = await driver.describe();
    await driver.close();

    expect(page).toContain('Loja de preview');
    expect(page).toContain('Total R$ 42,00');
    expect(seenByThirdParty.length).toBeGreaterThan(0);
    expect(
      seenByThirdParty.every(({ bypass, authorization }) => !bypass && !authorization),
    ).toBe(true);
  });

  it('meets the wall without them', async () => {
    const driver = new WebDriver({
      url: app,
      profileDir: await mkdtemp(join(tmpdir(), 'qz-access-')),
    });

    await driver.open().catch(() => undefined);
    const page = await driver.describe().catch(() => '');
    await driver.close();

    expect(page).not.toContain('Loja de preview');
  });
});
