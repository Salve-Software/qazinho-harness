import type {
  IFrameSink,
  IJobRunner,
  IPlanWalk,
  IRunnerApi,
  IWalkLog,
  Recording,
  RunnerJob,
} from './types';
import type { IRunVideo } from '@/contract';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { IVariableValue } from '@/engine/types';
import type { ICaseAgent } from '@/engine/walk/types';
import type { Harness } from '@/Harness.class';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { RUN_VIDEO_FILES } from '@/engine/devices/constants';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';
import { PlanWalker } from '@/engine/walk/PlanWalker.class';
import { RUNNER } from './constants';
import {
  bugTargetOf,
  evidenceKindOf,
  fileFactsOf,
  filedBugsOf,
  flatStepsOf,
  knownBugsOf,
  memoriesOfPlan,
  networkJsonOf,
  recipeBookOf,
  runBodyOf,
  stepChangesOf,
  shotFilesOf,
  valuesOf,
} from './library';
import { RunnerApiError } from './RunnerApiError.class';

/**
 * Anda um job do CI na máquina dele: abre o dispositivo, anda cada plano, manda cada run,
 * e diz como terminou.
 */
export class JobRunner {
  private readonly api: IRunnerApi;
  private readonly harness: Harness;
  private readonly workDir: string;
  private readonly deviceFor: IJobRunner['deviceFor'];
  private readonly agentFor: (job: RunnerJob) => ICaseAgent | null;
  private readonly frames: IFrameSink | null;
  private readonly heartbeatMs: number;
  private readonly now: () => number;
  private progress = {
    phase: 'booting',
    done: 0,
    total: 0,
    message: null as string | null,
  };

  public constructor(props: IJobRunner) {
    this.api = props.api;
    this.harness = props.harness;
    this.workDir = props.workDir;
    this.deviceFor = props.deviceFor;
    this.agentFor = props.agentFor;
    this.frames = props.frames;
    this.heartbeatMs = props.heartbeatMs ?? RUNNER.heartbeatMs;
    this.now = props.now ?? Date.now;
  }

  /** Anda o job, e diz como terminou: terminado, ou quebrado e por quê. */
  public async run(): Promise<void> {
    const job = await this.api.job();
    const heartbeat = setInterval(() => {
      this.beat();
    }, this.heartbeatMs);
    let driver: IDeviceDriver | null = null;
    let walker: PlanWalker | null = null;
    let isLate = false;
    const late = setTimeout(
      () => {
        isLate = true;
        walker?.stop();
      },
      Math.max(0, Date.parse(job.deadline) - RUNNER.deadlineMarginMs - this.now()),
    );

    this.progress = {
      phase: 'booting',
      done: 0,
      total: job.plans.reduce((sum, plan) => sum + plan.cases.length, 0),
      message: null,
    };
    this.beat();

    try {
      driver = await this.deviceFor({
        job,
        build: await this.buildOf(job),
        workDir: this.workDir,
      });
      await driver.open();

      const recording = await this.record(driver);
      const values = valuesOf(job.variables);
      const agent = this.agentFor(job);
      const walks: IPlanWalk[] = [];

      this.progress.phase = 'cases';
      this.beat();

      for (const [position, plan] of job.plans.entries()) {
        if (isLate) break;

        if (position > 0) await driver.restart().catch(() => undefined);

        const steps = flatStepsOf(plan.cases);
        const runId = `runner-${job.job.id}-${plan.id}`;
        const shotDir = join(this.workDir, RUNNER.runs, runId);
        const log: IWalkLog = {
          outcomes: [],
          began: new Map(),
          findings: [],
          startedAt: this.now(),
          endedAt: 0,
        };
        const lastOfCase = new Map(steps.map(({ caseId }, index) => [caseId, index]));

        await mkdir(shotDir, { recursive: true });
        walker = new PlanWalker({
          scope: plan.id,
          runId,
          driver,
          agent,
          harness: this.harness,
          target: { kind: job.target.kind, value: job.target.value },
          viewport: WEB_DRIVER.viewport,
          language: job.job.language,
          values,
          bugs: knownBugsOf({ bugs: job.bugs, planId: plan.id }),
          memories: memoriesOfPlan({ memories: job.memories, planId: plan.id }),
          answers: job.answers.filter(({ planId }) => planId === plan.id),
          shotDir,
          onEvent: (event) => {
            if (event.kind === 'doing') {
              log.began.set(event.index, event.at);
              this.progress.message = steps[event.index]?.caseTitle ?? null;
            }

            if (event.kind === 'step') {
              log.outcomes.push(event.outcome);

              if (lastOfCase.get(event.outcome.caseId) === event.outcome.index) {
                this.progress.done += 1;
                this.beat();
              }
            }

            if (event.kind === 'finding') log.findings.push(event.finding);
          },
        });

        const ended = await walker.walk({
          steps,
          mode: job.job.mode,
          book: recipeBookOf({ recordings: job.recordings, planId: plan.id }),
        });

        log.endedAt = this.now();
        walks.push({
          plan,
          runId,
          steps,
          log,
          recorded: ended.recorded,
          failure: ended.failure,
        });

        if (ended.failure !== null) break;
      }

      walker = null;
      this.progress = { ...this.progress, phase: 'uploading', message: null };
      this.beat();

      const video = await this.stopRecording({ driver, recording });
      const network = await this.keepNetwork({ driver, values });

      await driver.close();
      driver = null;
      await this.send({ job, walks, video, network, isLate });

      const failure = walks.find((walk) => walk.failure !== null)?.failure ?? null;

      await this.api.complete(
        failure === null
          ? { ending: 'finished', reason: null }
          : { ending: 'broke', reason: failure.slice(0, 500) },
      );
    } catch (reason) {
      walker?.stop();

      if (!(reason instanceof RunnerApiError && reason.status === 401))
        await this.api
          .complete({
            ending: 'broke',
            reason: (reason instanceof Error ? reason.message : String(reason)).slice(
              0,
              500,
            ),
          })
          .catch(() => undefined);
    } finally {
      clearInterval(heartbeat);
      clearTimeout(late);
      await driver?.close().catch(() => undefined);
    }
  }

  private beat(): void {
    void this.api.progress({ ...this.progress }).catch(() => undefined);
  }

  private async buildOf(job: RunnerJob): Promise<string | null> {
    if (job.build === null) return null;

    const file = join(this.workDir, RUNNER.build, job.build.fileName);

    await mkdir(dirname(file), { recursive: true });
    await this.api.build(file);

    return file;
  }

  /**
   * Grava o dispositivo: os frames de um navegador pelo ffmpeg da máquina, senão o
   * próprio celular.
   */
  private async record(driver: IDeviceDriver): Promise<Recording> {
    const frames = this.frames;
    const file = join(this.workDir, RUNNER.video);

    frames?.start(file);

    if (await driver.stream((jpeg) => frames?.push(jpeg))) {
      return frames === null ? { kind: 'none' } : { kind: 'frames', file };
    }

    await frames?.stop();

    const folder = join(this.workDir, RUNNER.runs);

    await mkdir(folder, { recursive: true });

    return (await driver.record(folder).catch(() => false))
      ? { kind: 'device', folder }
      : { kind: 'none' };
  }

  private async stopRecording(props: {
    driver: IDeviceDriver;
    recording: Recording;
  }): Promise<{ file: string; video: IRunVideo } | null> {
    const { recording } = props;

    if (recording.kind === 'none') return null;

    if (recording.kind === 'frames') {
      const video = (await this.frames?.stop()) ?? null;

      return video === null ? null : { file: recording.file, video };
    }

    const video = await props.driver.stopRecording().catch(() => null);

    if (video === null) return null;

    for (const name of [RUN_VIDEO_FILES.mp4, RUN_VIDEO_FILES.webm]) {
      const file = join(recording.folder, name);

      if ((await stat(file).catch(() => null))?.isFile() === true) return { file, video };
    }

    return null;
  }

  private async keepNetwork(props: {
    driver: IDeviceDriver;
    values: IVariableValue[];
  }): Promise<string | null> {
    const entries = props.driver.network?.() ?? [];

    if (entries.length === 0) return null;

    const file = join(this.workDir, RUNNER.network);

    await writeFile(file, networkJsonOf({ entries, values: props.values }), 'utf8');

    return file;
  }

  /**
   * Manda cada run com as evidências primeiro, depois os bugs que cada uma abriu ou viu
   * de novo, depois as gravações que cada uma fez.
   */
  private async send(props: {
    job: RunnerJob;
    walks: IPlanWalk[];
    video: { file: string; video: IRunVideo } | null;
    network: string | null;
    isLate: boolean;
  }): Promise<void> {
    const { job, walks, video, network } = props;
    const keys = await this.upload([
      ...shotFilesOf(walks),
      ...(video === null ? [] : [video.file]),
      ...(network === null ? [] : [network]),
    ]);
    const videoKey = video === null ? undefined : keys[video.file];
    const onVideo =
      video === null || videoKey === undefined
        ? null
        : { key: videoKey, startedAt: video.video.startedAt };

    for (const walk of walks) {
      const planId = walk.plan.id;
      const filed = filedBugsOf({
        log: walk.log,
        known: knownBugsOf({ bugs: job.bugs, planId }),
        caseTitleOf: (caseId) =>
          walk.plan.cases.find(({ id }) => id === caseId)?.title ?? caseId,
        target: bugTargetOf(job.target),
        run: {
          id: walk.runId,
          when: new Date(walk.log.startedAt).toISOString(),
          videoStartedAt: onVideo?.startedAt ?? null,
        },
        keys,
      });

      await this.api.putRun({
        planId,
        runId: walk.runId,
        body: runBodyOf({
          plan: walk.plan,
          steps: walk.steps,
          log: walk.log,
          target: job.target,
          endedBy:
            walk.failure !== null ? 'broke' : props.isLate ? 'interrupted' : 'finished',
          keys,
          bugIds: filed.bugIds,
          video: onVideo,
          network: network === null ? null : (keys[network] ?? null),
          changes: stepChangesOf({
            book: recipeBookOf({ recordings: job.recordings, planId: walk.plan.id }),
            recorded: walk.recorded,
          }),
        }),
      });

      for (const bug of filed.newBugs)
        await this.api.putBug({ planId, bugId: bug.id, body: bug.body });

      for (const seen of filed.sightings)
        await this.api.addSighting({
          planId,
          bugId: seen.bugId,
          sighting: seen.sighting,
        });

      if (walk.recorded.length > 0)
        await this.api.putRecordings({ planId, recordings: walk.recorded });
    }
  }

  /**
   * Sobe cada arquivo que a API aceita, e responde com a chave de cada um; um arquivo
   * ilegível ou recusado pela API fica de fora, a menos que o job tenha acabado.
   */
  private async upload(files: string[]): Promise<Record<string, string>> {
    const keys: Record<string, string> = {};

    for (const file of files) {
      const kind = evidenceKindOf(file);
      const facts = kind === null ? null : await fileFactsOf(file);

      if (kind === null || facts === null) continue;

      try {
        const grant = await this.api.evidence({ ...kind, ...facts });

        await this.api.upload({ grant, file });
        keys[file] = grant.key;
      } catch (reason) {
        if (reason instanceof RunnerApiError && reason.status === 401) throw reason;
      }
    }

    return keys;
  }
}
