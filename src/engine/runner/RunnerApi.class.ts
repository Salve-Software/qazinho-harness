import type {
  IBugBody,
  IEvidenceGrant,
  IRunBody,
  IRunnerApi,
  IRunnerApiProps,
  ISightingBody,
  RunnerJob,
} from './types';
import type { ICaseRecipe } from '@/contract';
import { createReadStream, createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { RUNNER_JOB_SCHEMA } from './constants';
import { RunnerApiError } from './RunnerApiError.class';

/** QAzinho's API as a CI run's machine calls it with its job's token: its job and build, the heartbeat, each file of evidence, what it walked, and how it ended. */
export class RunnerApi implements IRunnerApi {
  private readonly url: string;
  private readonly token: string;
  private readonly fetch: typeof fetch;

  public constructor(props: IRunnerApiProps) {
    this.url = props.url.replace(/\/+$/, '');
    this.token = props.token;
    this.fetch = props.fetch ?? globalThis.fetch;
  }

  /** The job, read against its schema; the first call marks it running. */
  public async job(): Promise<RunnerJob> {
    return RUNNER_JOB_SCHEMA.parse(
      await this.send({ method: 'GET', path: '/api/runner/job' }),
    );
  }

  /** Downloads the job's build into `file`, following the API to where it keeps it. */
  public async build(file: string): Promise<void> {
    const response = await this.answered({ method: 'GET', path: '/api/runner/build' });

    if (response.body === null) throw new Error('The API sent the build with no bytes.');

    await pipeline(Readable.fromWeb(response.body), createWriteStream(file));
  }

  public async progress(progress: {
    phase: string;
    done: number;
    total: number;
    message: string | null;
  }): Promise<void> {
    await this.send({ method: 'POST', path: '/api/runner/progress', body: progress });
  }

  /** Where to upload one file, and the key it will be known by. */
  public async evidence(file: {
    kind: 'screenshot' | 'video' | 'network';
    contentType: string;
    size: number;
    sha256: string;
  }): Promise<IEvidenceGrant> {
    return (await this.send({
      method: 'POST',
      path: '/api/runner/evidence',
      body: file,
    })) as IEvidenceGrant;
  }

  /** Streams a file from disk to the address the API signed, with its length, so a video never sits whole in memory. */
  public async upload(props: { grant: IEvidenceGrant; file: string }): Promise<void> {
    const { size } = await stat(props.file);
    const response = await this.fetch(props.grant.uploadUrl, {
      method: 'PUT',
      headers: { ...props.grant.headers, 'content-length': String(size) },
      body: Readable.toWeb(createReadStream(props.file)) as ReadableStream<Uint8Array>,
      duplex: 'half',
    });

    if (!response.ok)
      throw new RunnerApiError({
        status: response.status,
        code: 'upload_refused',
        path: 'the upload',
      });
  }

  public async putRun(props: {
    planId: string;
    runId: string;
    body: IRunBody;
  }): Promise<void> {
    await this.send({
      method: 'PUT',
      path: `/api/runner/plans/${encodeURIComponent(props.planId)}/runs/${encodeURIComponent(props.runId)}`,
      body: props.body,
    });
  }

  public async putBug(props: {
    planId: string;
    bugId: string;
    body: IBugBody;
  }): Promise<void> {
    await this.send({
      method: 'PUT',
      path: `/api/runner/plans/${encodeURIComponent(props.planId)}/bugs/${encodeURIComponent(props.bugId)}`,
      body: props.body,
    });
  }

  /** Adds a time the run saw a bug the job named again, leaving what the bug says. */
  public async addSighting(props: {
    planId: string;
    bugId: string;
    sighting: ISightingBody;
  }): Promise<void> {
    await this.send({
      method: 'POST',
      path: `/api/runner/plans/${encodeURIComponent(props.planId)}/bugs/${encodeURIComponent(props.bugId)}/sightings`,
      body: { sighting: props.sighting },
    });
  }

  /** Keeps the recordings the run made or healed, on the job's branch. */
  public async putRecordings(props: {
    planId: string;
    recordings: ICaseRecipe[];
  }): Promise<void> {
    await this.send({
      method: 'PUT',
      path: `/api/runner/plans/${encodeURIComponent(props.planId)}/recordings`,
      body: {
        recordings: props.recordings.map((recipe) => ({
          caseId: recipe.caseId,
          fingerprint: recipe.fingerprint,
          targetKind: recipe.targetKind,
          steps: recipe.steps,
          recordedAt: new Date(recipe.recordedAt).toISOString(),
        })),
      },
    });
  }

  /** Says the job walked what it could, or broke and why; the API then destroys the machine. */
  public async complete(ending: {
    ending: 'finished' | 'broke';
    reason: string | null;
  }): Promise<void> {
    await this.send({ method: 'POST', path: '/api/runner/complete', body: ending });
  }

  private async send(props: {
    method: string;
    path: string;
    body?: unknown;
  }): Promise<unknown> {
    const response = await this.answered(props);
    const text = await response.text();

    return text.length === 0 ? null : (JSON.parse(text) as unknown);
  }

  private async answered(props: {
    method: string;
    path: string;
    body?: unknown;
  }): Promise<Response> {
    const response = await this.fetch(`${this.url}${props.path}`, {
      method: props.method,
      headers: {
        authorization: `Bearer ${this.token}`,
        ...(props.body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      ...(props.body === undefined ? {} : { body: JSON.stringify(props.body) }),
    });

    if (response.ok) return response;

    const said = (await response.json().catch(() => null)) as { error?: unknown } | null;

    throw new RunnerApiError({
      status: response.status,
      code: typeof said?.error === 'string' ? said.error : 'unknown',
      path: props.path,
    });
  }
}
