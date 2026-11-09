/**
 * O runner do CI, andado de verdade: o `dist/runner.js` iniciado do jeito que a API do
 * QAzinho inicia uma máquina, contra uma API falsa que guarda cada chamada, num Chrome de
 * verdade sobre uma página que este teste serve. O job não dá agente, então o caso com
 * gravação é andado de novo a partir dela e o outro é pulado.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { flatStepsOf } from '@/engine/runner/library';
import { fingerprintOf } from '@/engine/walk/library';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

const PAGE = `<!doctype html><html><head><title>Loja</title></head><body>
<h1>Carrinho</h1><p>1 item</p>
<button onclick="pay()">Pagar com Pix</button><p id="code"></p>
<label>Anexar <input type="file" multiple onchange="document.getElementById('sent').textContent = 'Enviados: ' + [...this.files].map((file) => file.name).join(', ')"></label><p id="sent"></p>
<script>
async function pay() {
  const answer = await fetch('/app/api/charge', { method: 'POST' });
  const { code } = await answer.json();
  document.getElementById('code').textContent = 'Código Pix: ' + code;
}
</script></body></html>`;

const CASES = [
  {
    id: 'pix',
    title: 'Pagar com Pix',
    priority: 'P1',
    goal: '',
    preconditions: '',
    steps: [
      { action: 'Abrir o carrinho', expected: '1 item' },
      { action: 'Tocar em Pagar com Pix', expected: 'O código Pix aparece' },
    ],
  },
  {
    id: 'cupom',
    title: 'Aplicar um cupom',
    priority: 'P2',
    goal: '',
    preconditions: '',
    steps: [{ action: 'Aplicar OFF10', expected: 'O total cai 10%' }],
  },
  {
    id: 'lote',
    title: 'Enviar o lote',
    priority: 'P1',
    goal: '',
    preconditions: '',
    steps: [{ action: 'Anexar capa.html e logo.png', expected: 'Os dois aparecem' }],
  },
];

interface IKept {
  method: string;
  path: string;
  body: unknown;
}

const FILE_SHA = 'c'.repeat(64);

const kept: IKept[] = [];
const uploads = new Map<string, number>();
let base = '';

async function bodyOf(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) chunks.push(chunk as Buffer);

  return Buffer.concat(chunks);
}

function jobOf() {
  return {
    job: {
      id: 'smoke-1',
      platform: 'web',
      mode: 'plan',
      attempt: 1,
      language: 'pt',
      origin: 'manual',
      originLabel: 'smoke',
    },
    deadline: new Date(Date.now() + 3_600_000).toISOString(),
    aiCreditCap: 10,
    agent: 'none',
    model: null,
    project: { id: 'p1', key: 'LOJA', name: 'Loja' },
    target: { kind: 'web', label: 'Local', value: `${base}/app` },
    git: null,
    plans: [{ id: 'plan-1', name: 'Checkout', version: 1, cases: CASES }],
    recordings: [
      {
        planId: 'plan-1',
        caseId: 'pix',
        fingerprint: fingerprintOf({
          targetKind: 'web',
          steps: flatStepsOf(CASES).filter(({ caseId }) => caseId === 'pix'),
        }),
        targetKind: 'web',
        steps: [
          { number: 1, actions: [], proof: '1 item' },
          {
            number: 2,
            actions: [{ kind: 'click', target: 'Pagar com Pix', value: '' }],
            proof: 'Código Pix: 123',
          },
        ],
        recordedAt: new Date().toISOString(),
      },
      {
        planId: 'plan-1',
        caseId: 'lote',
        fingerprint: fingerprintOf({
          targetKind: 'web',
          steps: flatStepsOf(CASES).filter(({ caseId }) => caseId === 'lote'),
        }),
        targetKind: 'web',
        steps: [
          {
            number: 1,
            actions: [
              {
                kind: 'upload',
                target: 'Anexar',
                value: 'capa.html, logo.png',
                files: [`${FILE_SHA}/capa.html`, '/Users/quem-gravou/lote/logo.png'],
              },
            ],
            proof: 'Enviados: capa.html, logo.png',
          },
        ],
        recordedAt: new Date().toISOString(),
      },
    ],
    bugs: [],
    variables: [],
    build: null,
  };
}

async function serve(request: IncomingMessage, response: ServerResponse) {
  const path = (request.url ?? '/').split('?')[0] ?? '/';
  const method = request.method ?? 'GET';
  const body = await bodyOf(request);
  const json = (status: number, value?: unknown) => {
    response.writeHead(status, { 'content-type': 'application/json' });
    response.end(value === undefined ? undefined : JSON.stringify(value));
  };

  if (path === '/app') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(PAGE);

    return;
  }

  if (path === '/app/api/charge') return json(200, { code: '123' });

  if (path.startsWith('/upload/')) {
    uploads.set(path.slice('/upload/'.length), body.length);

    return json(200);
  }

  if (request.headers.authorization !== 'Bearer qzj_smoke')
    return json(401, { error: 'job_over' });

  kept.push({
    method,
    path,
    body: body.length === 0 ? null : (JSON.parse(body.toString('utf8')) as unknown),
  });

  if (path === '/api/runner/job') return json(200, jobOf());

  if (path === `/api/runner/files/${FILE_SHA}`) {
    response.writeHead(200, { 'content-type': 'application/octet-stream' });
    response.end('<h1>Capa de verdade</h1>');

    return;
  }

  if (path === '/api/runner/evidence') {
    const key = `ev-${String(kept.filter((one) => one.path === path).length)}`;

    return json(200, { key, uploadUrl: `${base}/upload/${key}`, headers: {} });
  }

  if (method === 'PUT' || method === 'POST')
    return path.endsWith('/progress') || path.endsWith('/complete')
      ? json(204)
      : json(200, {});

  return json(404, { error: 'not_found' });
}

const callsTo = (ending: string) => kept.filter(({ path }) => path.endsWith(ending));

describe('the CI runner, on real Chrome against a fake API', () => {
  const server = createServer((request, response) => {
    void serve(request, response);
  });
  let exit: number | null = null;
  let printed = '';

  beforeAll(async () => {
    execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: 'ignore' });
    await new Promise<void>((listening) => {
      server.listen(0, '127.0.0.1', listening);
    });
    base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;

    const runner = spawn(process.execPath, [join(ROOT, 'dist', 'runner.js')], {
      env: {
        ...process.env,
        QAZINHO_API_URL: base,
        QAZINHO_JOB_TOKEN: 'qzj_smoke',
        QAZINHO_JOB_ID: 'smoke-1',
        QAZINHO_WORK_DIR: await mkdtemp(join(tmpdir(), 'qazinho-runner-smoke-')),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    runner.stdout.on('data', (chunk: Buffer) => {
      printed += chunk.toString();
    });
    runner.stderr.on('data', (chunk: Buffer) => {
      printed += chunk.toString();
    });
    exit = await new Promise<number | null>((done) => {
      runner.on('close', done);
    });
  });

  afterAll(() => {
    server.close();
  });

  it('ends the job finished, having beaten while it walked', () => {
    expect({ exit, printed }).toMatchObject({ exit: 0 });
    expect(callsTo('/complete').map(({ body }) => body)).toEqual([
      { ending: 'finished', reason: null },
    ]);
    expect(
      callsTo('/progress').map(({ body }) => (body as { phase: string }).phase),
    ).toEqual(expect.arrayContaining(['booting', 'cases', 'uploading']));
  });

  it('walks the case with a recording again on Chrome, and skips the one with none', () => {
    const [run] = callsTo('/runs/runner-smoke-1-plan-1');
    const body = run?.body as {
      endedBy: string;
      cases: {
        id: string;
        verdict: string;
        steps: { by: string; shot: string | null }[];
      }[];
      network: string | null;
    };

    expect(body.endedBy).toBe('finished');
    expect(body.cases.map(({ id, verdict }) => [id, verdict])).toEqual([
      ['pix', 'passed'],
      ['cupom', 'skipped'],
      ['lote', 'passed'],
    ]);
    expect(
      body.cases[0]?.steps.every(({ by, shot }) => by === 'replay' && shot !== null),
    ).toBe(true);
  });

  it('fetches the file the org keeps, and stands in a sample for the one it does not', () => {
    expect(callsTo(`/files/${FILE_SHA}`)).toHaveLength(1);
    expect(kept.filter(({ path }) => path.includes('/files/'))).toHaveLength(1);
  });

  it('uploads each screen and the requests the page made, before the run that names them', () => {
    const kinds = callsTo('/evidence').map(({ body }) => (body as { kind: string }).kind);
    const run = callsTo('/runs/runner-smoke-1-plan-1')[0]?.body as {
      network: string | null;
    };

    expect(kinds).toEqual(['screenshot', 'screenshot', 'screenshot', 'network']);
    expect(run.network).not.toBeNull();
    expect(uploads.get(run.network ?? '') ?? 0).toBeGreaterThan(0);
    expect(kept.findIndex(({ path }) => path === '/api/runner/evidence')).toBeLessThan(
      kept.findIndex(({ path }) => path.includes('/runs/')),
    );
  });
});
