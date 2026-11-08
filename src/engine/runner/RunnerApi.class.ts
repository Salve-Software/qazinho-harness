import type {
  IBugBody,
  IEvidenceGrant,
  IRunBody,
  IRunnerApi,
  IRunnerApiProps,
  ISightingBody,
  RunnerJob,
} from './types';
import type { DivergenceCause, ICaseRecipe } from '@/contract';
import { createReadStream, createWriteStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { RUNNER_JOB_SCHEMA } from './constants';
import { RunnerApiError } from './RunnerApiError.class';

/**
 * A API do QAzinho como a máquina de uma run do CI a chama com o token do job: o job e o
 * build, o sinal de vida, cada arquivo de evidência, o que ela andou, e como terminou.
 */
export class RunnerApi implements IRunnerApi {
  private readonly url: string;
  private readonly token: string;
  private readonly fetch: typeof fetch;

  public constructor(props: IRunnerApiProps) {
    this.url = props.url.replace(/\/+$/, '');
    this.token = props.token;
    this.fetch = props.fetch ?? globalThis.fetch;
  }

  /** O job, lido contra o schema; a primeira chamada o marca como rodando. */
  public async job(): Promise<RunnerJob> {
    return RUNNER_JOB_SCHEMA.parse(
      await this.send({ method: 'GET', path: '/api/runner/job' }),
    );
  }

  /** Baixa o build do job em `file`, seguindo a API até onde ela o guarda. */
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

  /** Por que uma gravação falhou, quando há certeza; null senão, ou sem resposta. */
  public async whyDiverged(asked: {
    step: string;
    proof: string;
    screen: string;
  }): Promise<DivergenceCause | null> {
    const answer = await this.send({
      method: 'POST',
      path: '/api/runner/divergence',
      body: asked,
    }).catch(() => null);

    return (answer as { cause?: DivergenceCause | null } | null)?.cause ?? null;
  }

  /** Onde subir um arquivo, e a chave pela qual ele será conhecido. */
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

  /**
   * Transmite um arquivo do disco para o endereço que a API assinou, com o tamanho, para
   * um vídeo nunca ficar inteiro na memória.
   */
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

  /**
   * Acrescenta uma vez em que a run viu de novo um bug que o job nomeou, deixando o que o
   * bug diz.
   */
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

  /** Guarda as gravações que a run fez ou consertou, na branch do job. */
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

  /**
   * Diz que o job andou o que pôde, ou quebrou e por quê; a API então destrói a máquina.
   */
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
