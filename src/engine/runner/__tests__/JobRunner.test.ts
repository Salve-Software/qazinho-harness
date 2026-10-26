import type { IRunVideo } from '@/contract';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { IFrameSink, IRunnerApi, RunnerJob } from '@/engine/runner/types';
import type { CaseTurnEnd, ICaseAgent, ICaseTurn } from '@/engine/walk/types';
import type { IStepReport } from '@/tools/servers/device/types';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JobRunner, RUNNER, RunnerApiError } from '@/engine/runner';
import { Harness } from '@/Harness.class';

/** A job of one plan on the web: paying with Pix in two steps, and a coupon in one. */
const JOB: RunnerJob = {
  job: {
    id: 'j1',
    platform: 'web',
    mode: 'plan',
    attempt: 1,
    language: 'en',
    origin: 'pr',
    originLabel: '#482 feat/pix',
  },
  deadline: new Date(Date.now() + 3_600_000).toISOString(),
  aiCreditCap: 40,
  agent: 'gateway',
  model: 'claude-haiku-5-5',
  project: { id: 'p1', key: 'LOJA', name: 'Loja' },
  target: { kind: 'web', label: 'Preview', value: 'https://pr-482.loja.test' },
  plans: [
    {
      id: 'plan-1',
      name: 'Checkout',
      version: 2,
      cases: [
        {
          id: 'pix',
          title: 'Pay with Pix',
          priority: 'P1',
          goal: '',
          preconditions: '',
          steps: [
            { action: 'Open the cart', expected: 'One item' },
            { action: 'Pay with Pix', expected: 'The Pix code shows' },
          ],
        },
        {
          id: 'coupon',
          title: 'Apply a coupon',
          priority: 'P2',
          goal: '',
          preconditions: '',
          steps: [{ action: 'Apply OFF10', expected: 'The total drops' }],
        },
      ],
    },
  ],
  recordings: [],
  bugs: [],
  variables: [{ name: 'USER', description: null, value: 'ana@loja.test' }],
  build: null,
};

/** The API as a runner calls it: each call kept by name, each file granted the next key. */
function fakeApi(
  props: { job?: RunnerJob; refuse?: (name: string) => Error | null } = {},
) {
  const calls: { name: string; args: unknown }[] = [];
  const said = (name: string, args?: unknown) => {
    calls.push({ name, args });

    const refusal = props.refuse?.(name) ?? null;

    return refusal === null ? Promise.resolve() : Promise.reject(refusal);
  };
  let keys = 0;
  const api: IRunnerApi = {
    job: async () => {
      await said('job');

      return props.job ?? JOB;
    },
    build: async (file) => {
      await said('build', file);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, 'apk');
    },
    progress: (progress) => said('progress', progress),
    evidence: async (file) => {
      await said('evidence', file);
      keys += 1;

      return { key: `ev/${String(keys)}`, uploadUrl: 'https://r2.test', headers: {} };
    },
    upload: (upload) => said('upload', upload.file),
    putRun: (run) => said('putRun', run),
    putBug: (bug) => said('putBug', bug),
    addSighting: (seen) => said('addSighting', seen),
    putRecordings: (recordings) => said('putRecordings', recordings),
    complete: (ending) => said('complete', ending),
  };
  const of = (name: string) =>
    calls.filter((call) => call.name === name).map(({ args }) => args);

  return { api, calls, of, names: () => calls.map(({ name }) => name) };
}

/** A browser whose every screenshot is a file on disk, which streams frames or not, and keeps the requests it says. */
function fakeDriver(props: { isBrowser: boolean }) {
  const happened: string[] = [];
  const driver: IDeviceDriver = {
    open: () => {
      happened.push('open');

      return Promise.resolve();
    },
    restart: () => Promise.resolve(),
    act: () => Promise.resolve(),
    describe: () => Promise.resolve('Cart: 1 item'),
    inspect: () => Promise.resolve(''),
    glance: () => Promise.resolve(null),
    motion: () => Promise.resolve(null),
    resize: () => Promise.resolve(),
    focus: () => Promise.resolve(),
    shoot: async (file) => {
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, 'jpeg');

      return { file, dataUrl: '' };
    },
    stream: (onFrame) => {
      if (props.isBrowser) onFrame(Buffer.from('frame'));

      return Promise.resolve(props.isBrowser);
    },
    record: async (folder) => {
      happened.push('record');
      await writeFile(join(folder, 'run.webm'), 'webm');

      return true;
    },
    stopRecording: () =>
      Promise.resolve({
        startedAt: Date.now() - 5_000,
        durationMs: 5_000,
        width: 1080,
        height: 2400,
      }),
    close: () => {
      happened.push('close');

      return Promise.resolve();
    },
    network: () => [
      {
        id: 1,
        method: 'GET',
        url: 'https://pr-482.loja.test/api/cart',
        type: 'fetch',
        status: 200,
        failure: null,
        startedAt: Date.now(),
        durationMs: 20,
        size: 10,
      },
    ],
  };

  return { driver, happened };
}

/** Frames recorded into a video as long as the walk ran. */
function fakeFrames(): IFrameSink & { frames: number } {
  let startedAt = 0;
  const sink = {
    frames: 0,
    start: (file: string) => {
      startedAt = Date.now();
      void mkdir(dirname(file), { recursive: true }).then(() => writeFile(file, 'mp4'));
    },
    push: () => {
      sink.frames += 1;
    },
    stop: (): Promise<IRunVideo | null> =>
      Promise.resolve({ startedAt, durationMs: 1_000, width: 1280, height: 800 }),
  };

  return sink;
}

const report = (step: number, overrides: Partial<IStepReport> = {}): IStepReport => ({
  step,
  verdict: 'passed',
  why: 'As expected',
  got: 'As expected',
  title: '',
  severity: 'medium',
  note: '',
  proof: `Proof ${String(step)}`,
  ...overrides,
});

/** An agent that passes every step of every case, unless the test plays the case its own way. */
function agentThat(
  play?: (turn: ICaseTurn) => Promise<CaseTurnEnd | undefined>,
): ICaseAgent {
  return {
    walk: async (turn) => {
      const played = await play?.(turn);

      if (played !== undefined) return played;

      for (const step of [1, 2]) await turn.device.onReport?.(report(step));

      return { kind: 'ended', costUsd: null };
    },
    cancel: () => undefined,
  };
}

async function runWith(props: {
  job?: RunnerJob;
  agent?: ICaseAgent | null;
  isBrowser?: boolean;
  frames?: IFrameSink | null;
  refuse?: (name: string) => Error | null;
}) {
  const workDir = await mkdtemp(join(tmpdir(), 'qazinho-job-'));
  const api = fakeApi({ job: props.job, refuse: props.refuse });
  const device = fakeDriver({ isBrowser: props.isBrowser ?? true });
  const runner = new JobRunner({
    api: api.api,
    harness: new Harness(),
    workDir,
    deviceFor: () => Promise.resolve(device.driver),
    agentFor: () => (props.agent === undefined ? agentThat() : props.agent),
    frames: props.frames === undefined ? fakeFrames() : props.frames,
  });

  await runner.run();

  return { ...api, device, workDir };
}

describe('JobRunner', () => {
  it('walks each plan, sends its run with its screens, video and requests, then ends finished', async () => {
    const { names, of, device } = await runWith({});
    const [run] = of('putRun') as {
      planId: string;
      runId: string;
      body: Record<string, unknown>;
    }[];

    expect(names()[0]).toBe('job');
    expect(names().slice(-2)).toEqual(['putRecordings', 'complete']);
    expect(of('complete')).toEqual([{ ending: 'finished', reason: null }]);
    expect(run).toMatchObject({
      planId: 'plan-1',
      runId: 'runner-j1-plan-1',
      body: {
        kind: 'run',
        endedBy: 'finished',
        counts: { passed: 2, failed: 0, blocked: 0, skipped: 0 },
        video: expect.stringMatching(/^ev\//) as unknown,
        network: expect.stringMatching(/^ev\//) as unknown,
      },
    });
    expect(
      (
        run?.body.cases as { steps: { shot: string | null; span: unknown }[] }[]
      )[0]?.steps.every(({ shot, span }) => shot !== null && span !== null),
    ).toBe(true);
    expect(of('evidence').map((file) => (file as { kind: string }).kind)).toEqual([
      'screenshot',
      'screenshot',
      'screenshot',
      'video',
      'network',
    ]);
    expect(device.happened).toEqual(['open', 'close']);
  });

  it('files a step that failed as a new bug, after the run that names it', async () => {
    const { names, of } = await runWith({
      agent: agentThat(async (turn) => {
        if (!turn.prompt.includes('Pay with Pix')) return undefined;

        await turn.device.onReport?.(report(1));
        await turn.device.onReport?.(
          report(2, {
            verdict: 'failed',
            why: 'No code',
            title: 'Pix code never shows',
            severity: 'high',
          }),
        );

        return { kind: 'ended', costUsd: null };
      }),
    });
    const [bug] = of('putBug') as {
      bugId: string;
      body: { title: string; caught: { runId: string } };
    }[];

    expect(names().indexOf('putBug')).toBeGreaterThan(names().indexOf('putRun'));
    expect(bug).toMatchObject({
      bugId: 'runner-j1-plan-1-bug-1',
      body: { title: 'Pix code never shows', caught: { runId: 'runner-j1-plan-1' } },
    });
    expect(of('complete')).toEqual([{ ending: 'finished', reason: null }]);
  });

  it('sees an open bug the job named again, and files nothing new for it', async () => {
    const { of } = await runWith({
      job: {
        ...JOB,
        bugs: [
          {
            id: 'desktop-bug-7',
            planId: 'plan-1',
            title: 'Pix code never shows',
            caseId: 'pix',
            stepNumber: 2,
            isIncidental: false,
            status: 'open',
          },
        ],
      },
      agent: agentThat(async (turn) => {
        if (!turn.prompt.includes('Pay with Pix')) return undefined;

        await turn.device.onReport?.(report(1));
        await turn.device.onReport?.(
          report(2, {
            verdict: 'failed',
            why: 'No code',
            title: 'Pix code never shows',
            sameAs: 'desktop-bug-7',
          }),
        );

        return { kind: 'ended', costUsd: null };
      }),
    });

    expect(of('putBug')).toEqual([]);
    expect(of('addSighting')).toMatchObject([
      {
        planId: 'plan-1',
        bugId: 'desktop-bug-7',
        sighting: { runId: 'runner-j1-plan-1', stepNumber: 2 },
      },
    ]);
  });

  it('keeps the recordings its agent made, on the plan', async () => {
    const { of } = await runWith({});

    expect(of('putRecordings')).toMatchObject([
      { planId: 'plan-1', recordings: [{ caseId: 'pix' }, { caseId: 'coupon' }] },
    ]);
  });

  it('ends broke with why when its agent could not walk a case', async () => {
    const { of } = await runWith({
      agent: agentThat(() =>
        Promise.resolve({
          kind: 'failed',
          reason: 'The model answered 529: overloaded',
          costUsd: null,
        }),
      ),
    });

    expect(of('putRun')).toMatchObject([{ body: { endedBy: 'broke' } }]);
    expect(of('complete')).toEqual([
      { ending: 'broke', reason: 'The model answered 529: overloaded' },
    ]);
  });

  it('ends broke with why when the API refuses what it sends', async () => {
    const { of } = await runWith({
      refuse: (name) =>
        name === 'putRun'
          ? new RunnerApiError({
              status: 500,
              code: 'internal',
              path: '/api/runner/plans',
            })
          : null,
    });

    expect(of('complete')).toEqual([
      {
        ending: 'broke',
        reason: 'The API answered 500 (internal) to /api/runner/plans.',
      },
    ]);
  });

  it('does NOT end a job the API says is over', async () => {
    const { of, device } = await runWith({
      refuse: (name) =>
        name === 'putRun'
          ? new RunnerApiError({
              status: 401,
              code: 'job_over',
              path: '/api/runner/plans',
            })
          : null,
    });

    expect(of('complete')).toEqual([]);
    expect(device.happened.at(-1)).toBe('close');
  });

  it('records a phone through the phone itself, with no frames to encode', async () => {
    const frames = fakeFrames();
    const { of, device } = await runWith({ isBrowser: false, frames });

    expect(device.happened).toContain('record');
    expect(frames.frames).toBe(0);
    expect(
      of('evidence').map((file) => (file as { contentType: string }).contentType),
    ).toContain('video/webm');
  });

  it('walks recordings alone when the job gives its cases no agent', async () => {
    const { of } = await runWith({ agent: null });

    expect(of('putRun')).toMatchObject([
      { body: { counts: { passed: 0, failed: 0, blocked: 0, skipped: 2 } } },
    ]);
    expect(of('complete')).toEqual([{ ending: 'finished', reason: null }]);
  });

  it('stops walking once its deadline draws near, and sends the run as interrupted', async () => {
    const { of } = await runWith({
      job: {
        ...JOB,
        deadline: new Date(Date.now() + RUNNER.deadlineMarginMs + 100).toISOString(),
      },
      agent: agentThat(async (turn) => {
        await new Promise((wake) => setTimeout(wake, 300));

        for (const step of [1, 2]) await turn.device.onReport?.(report(step));

        return { kind: 'ended', costUsd: null };
      }),
    });
    const [run] = of('putRun') as {
      body: { endedBy: string; cases: { id: string; verdict: string }[] };
    }[];

    expect(run?.body.endedBy).toBe('interrupted');
    expect(run?.body.cases.find(({ id }) => id === 'coupon')?.verdict).toBe('skipped');
    expect(of('complete')).toEqual([{ ending: 'finished', reason: null }]);
  });
});
