import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RunnerApi, RunnerApiError } from '@/engine/runner';

const JOB = {
  job: {
    id: 'j1',
    platform: 'web',
    mode: 'plan',
    attempt: 1,
    language: 'pt',
    origin: 'pr',
    originLabel: '#482 feat/pix',
  },
  deadline: '2026-10-24T11:00:00.000Z',
  aiCreditCap: 40,
  agent: 'gateway',
  model: 'claude-haiku-5-5',
  project: { id: 'p1', key: 'LOJA', name: 'Loja' },
  target: { kind: 'web', label: 'Preview', value: 'https://pr-482.loja.test' },
  git: null,
  plans: [],
  recordings: [],
  bugs: [],
  variables: [],
  build: null,
};

interface ICall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

/** A fetch that answers each call as the test says, and keeps what each sent. */
function fakeFetch(
  answer: (call: ICall) => Response = () => new Response(null, { status: 204 }),
) {
  const calls: ICall[] = [];
  const fetcher = (async (url: string, init: RequestInit = {}) => {
    const body =
      typeof init.body === 'string'
        ? init.body
        : init.body instanceof ReadableStream
          ? await new Response(init.body).text()
          : null;
    const call = {
      url,
      method: init.method ?? 'GET',
      headers: (init.headers ?? {}) as Record<string, string>,
      body,
    };

    calls.push(call);

    return answer(call);
  }) as typeof fetch;

  return { fetcher, calls };
}

const apiWith = (fetcher: typeof fetch) =>
  new RunnerApi({ url: 'https://api.qazinho.test/', token: 'qzj_token', fetch: fetcher });

describe('RunnerApi', () => {
  it('reads its job with the job’s token, against the job’s schema', async () => {
    const { fetcher, calls } = fakeFetch(() => Response.json(JOB));

    const job = await apiWith(fetcher).job();

    expect(job.model).toBe('claude-haiku-5-5');
    expect(calls[0]).toMatchObject({
      url: 'https://api.qazinho.test/api/runner/job',
      method: 'GET',
      headers: { authorization: 'Bearer qzj_token' },
    });
  });

  it('writes a run, a bug, a sighting and the recordings where the protocol says', async () => {
    const { fetcher, calls } = fakeFetch(() => Response.json({ ok: true }));
    const api = apiWith(fetcher);

    await api.putRun({ planId: 'pl 1', runId: 'r1', body: {} as never });
    await api.putBug({ planId: 'pl1', bugId: 'b1', body: {} as never });
    await api.addSighting({ planId: 'pl1', bugId: 'b1', sighting: { at: 3 } as never });
    await api.putRecordings({
      planId: 'pl1',
      recordings: [
        {
          caseId: 'c1',
          fingerprint: 'fp',
          targetKind: 'web',
          steps: [],
          runId: 'r1',
          recordedAt: 0,
        },
      ],
    });
    await api.complete({ ending: 'finished', reason: null });

    expect(
      calls.map(
        ({ method, url }) => `${method} ${url.replace('https://api.qazinho.test', '')}`,
      ),
    ).toEqual([
      'PUT /api/runner/plans/pl%201/runs/r1',
      'PUT /api/runner/plans/pl1/bugs/b1',
      'POST /api/runner/plans/pl1/bugs/b1/sightings',
      'PUT /api/runner/plans/pl1/recordings',
      'POST /api/runner/complete',
    ]);
    expect(JSON.parse(calls[2]?.body ?? '{}')).toEqual({ sighting: { at: 3 } });
    expect(JSON.parse(calls[3]?.body ?? '{}')).toEqual({
      recordings: [
        {
          caseId: 'c1',
          fingerprint: 'fp',
          targetKind: 'web',
          steps: [],
          recordedAt: '1970-01-01T00:00:00.000Z',
        },
      ],
    });
  });

  it('refuses with the status and the code the API answered', async () => {
    const { fetcher } = fakeFetch(() =>
      Response.json({ error: 'job_over' }, { status: 401 }),
    );

    await expect(
      apiWith(fetcher).progress({ phase: 'cases', done: 1, total: 2, message: null }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'job_over',
    });
    await expect(apiWith(fetcher).job()).rejects.toBeInstanceOf(RunnerApiError);
  });

  it('streams a file to the address the API signed, with its headers and length', async () => {
    const file = join(await mkdtemp(join(tmpdir(), 'qazinho-upload-')), 'step-1.jpg');
    const { fetcher, calls } = fakeFetch(() => new Response(null, { status: 200 }));

    await writeFile(file, 'jpeg');
    await apiWith(fetcher).upload({
      grant: {
        key: 'ev/1',
        uploadUrl: 'https://r2.test/ev/1?signed',
        headers: { 'content-type': 'image/jpeg' },
      },
      file,
    });

    expect(calls[0]).toEqual({
      url: 'https://r2.test/ev/1?signed',
      method: 'PUT',
      headers: { 'content-type': 'image/jpeg', 'content-length': '4' },
      body: 'jpeg',
    });
  });

  it('downloads the build into the file it is told', async () => {
    const file = join(await mkdtemp(join(tmpdir(), 'qazinho-build-')), 'loja.apk');
    const { fetcher } = fakeFetch(() => new Response('apk bytes', { status: 200 }));

    await apiWith(fetcher).build(file);

    expect(await readFile(file, 'utf8')).toBe('apk bytes');
  });
});
