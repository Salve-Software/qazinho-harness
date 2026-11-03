import type {
  CaseWalk,
  ICaseAgent,
  IIndexedStep,
  IPlanWalker,
  IWalkEnd,
  WalkEvent,
  WalkMode,
} from './types';
import type {
  ICaseRecipe,
  IFlatStep,
  IKnownBug,
  IStepAsked,
  IRecipeBook,
  IStepAction,
  IStepOutcome,
  ITargetUnderTest,
  IViewport,
  Language,
  UnwalkedReason,
} from '@/contract';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { IVariableValue } from '@/engine/types';
import type { Harness } from '@/Harness.class';
import type {
  IDevicePort,
  IQaQuestion,
  IStepFinding,
  IStepReport,
} from '@/tools/servers/device/types';
import { join } from 'node:path';
import { RUN_WALK, UNWALKED } from './constants';
import {
  casesOf,
  expectedValuesOf,
  findingAnswer,
  keptBugId,
  missingValuesOf,
  outcomeOfReport,
  proofHolds,
  proofWithValues,
  provableProof,
  recipeFor,
  recipeOf,
  recordedAction,
  replayedOutcome,
  stepCarryOn,
  unwalkedOutcome,
  variablePort,
} from './library';

/**
 * Anda os casos de um plano num dispositivo, cada um no app aberto do zero: pela gravação
 * sem agente onde uma vale, pelo agente onde não.
 */
export class PlanWalker {
  private readonly scope: string;
  private readonly runId: string;
  private readonly driver: IDeviceDriver;
  private readonly agent: ICaseAgent | null;
  private readonly harness: Harness;
  private readonly target: ITargetUnderTest;
  private readonly viewport: IViewport;
  private readonly language: Language;
  private readonly values: IVariableValue[];
  private readonly bugs: IKnownBug[];
  private readonly answers: { caseId: string; question: string; answer: string }[];
  private readonly shotDir: string;
  private readonly onEvent: (event: WalkEvent) => void;
  private isStopped = false;
  private isCapped = false;

  public constructor(props: IPlanWalker) {
    this.scope = props.scope;
    this.runId = props.runId;
    this.driver = props.driver;
    this.agent = props.agent;
    this.harness = props.harness;
    this.target = props.target;
    this.viewport = props.viewport;
    this.language = props.language;
    this.values = props.values;
    this.bugs = props.bugs;
    this.answers = props.answers ?? [];
    this.shotDir = props.shotDir;
    this.onEvent = props.onEvent;
  }

  /**
   * Anda cada caso em ordem do jeito que o `mode` diz, e responde com as gravações que o
   * agente fez e por que o walk parou no meio, se parou.
   */
  public async walk(props: {
    steps: IFlatStep[];
    mode: WalkMode;
    book: IRecipeBook;
  }): Promise<IWalkEnd> {
    const recorded: ICaseRecipe[] = [];
    const filed: string[] = [];

    for (const [position, steps] of casesOf(props.steps).entries()) {
      if (this.isStopped) break;

      if (position > 0) await this.driver.restart().catch(() => undefined);

      if (this.isStopped) break;

      const missing = missingValuesOf({
        steps: steps.map(({ step }) => step),
        values: this.values,
      });

      if (missing.length > 0) {
        this.unwalked({
          pending: [...steps],
          verdict: 'skipped',
          reason: 'noValue',
          why: `${UNWALKED.noValue} ${missing.map((name) => `\${${name}}`).join(', ')}`,
        });
        continue;
      }

      const recipe =
        props.mode === 'agent'
          ? null
          : recipeFor({
              book: props.book,
              steps: steps.map(({ step }) => step),
              targetKind: this.target.kind,
            });
      const replayed = recipe === null ? null : await this.replayCase({ steps, recipe });

      if (replayed === 'stopped') break;

      if (replayed === 'replayed') continue;

      if (replayed === 'diverged') await this.driver.restart().catch(() => undefined);

      if (this.isStopped) break;

      if (props.mode === 'recorded' || this.agent === null || this.isCapped) {
        this.unwalked({
          pending: [...steps],
          verdict: 'skipped',
          reason: this.isCapped ? 'capped' : 'noAgent',
        });
        continue;
      }

      const walked = await this.walkCase({
        agent: this.agent,
        steps,
        filed,
        recorded,
        isHealing: replayed === 'diverged',
      });

      if (walked.kind === 'stopped') break;

      if (walked.kind === 'failed') return { recorded, failure: walked.reason };
    }

    return { recorded, failure: null };
  }

  /**
   * Para o walk: o caso em andamento termina com o turno do agente, e nenhum outro caso
   * começa.
   */
  public stop(): void {
    this.isStopped = true;
    this.agent?.cancel(this.scope);
  }

  /**
   * Um turno do agente num caso, guardado como gravação quando todo passo passou com a
   * prova; uma pergunta ao QA termina o caso, já que ninguém responde.
   */
  private async walkCase(props: {
    agent: ICaseAgent;
    steps: IIndexedStep[];
    filed: string[];
    recorded: ICaseRecipe[];
    isHealing: boolean;
  }): Promise<CaseWalk> {
    const { agent } = props;
    const pending = [...props.steps];
    const actions = new Map<number, IStepAction[]>();
    const proofs = new Map<number, string>();
    const device = variablePort({ device: this.driver, values: this.values });
    let began = Date.now();
    let hasFailed = false;
    let isOver = false;
    let over: () => void = () => undefined;
    const caseOver = new Promise<null>((resolve) => {
      over = () => {
        resolve(null);
      };
    });

    const endCase = (said: string) => {
      isOver = true;
      over();
      setImmediate(() => {
        agent.cancel(this.scope);
      });

      return said;
    };

    const onReport = async (report: IStepReport): Promise<string> => {
      const walking = pending[0];

      if (walking === undefined)
        return 'Every step of this case is reported. End your turn now.';

      if (report.step !== walking.step.numberInCase)
        return `Step ${String(walking.step.numberInCase)} is not reported yet: carry it out and report it first.`;

      pending.shift();

      if (report.note.length > 0) this.onEvent({ kind: 'note', text: report.note });

      const shot = await this.driver.shoot(
        join(this.shotDir, `step-${String(walking.index + 1)}.jpg`),
      );
      const at = Date.now();
      const kept =
        report.verdict === 'failed'
          ? keptBugId({ asked: report.sameAs, known: this.bugs })
          : null;
      const outcome = outcomeOfReport({
        report: { ...report, sameAs: kept ?? undefined },
        step: walking.step,
        index: walking.index,
        workspaceId: this.scope,
        tookMs: at - began,
        at,
        shot,
      });

      this.onEvent({
        kind: 'step',
        outcome: props.isHealing ? { ...outcome, by: 'healed' } : outcome,
      });

      if (report.verdict === 'passed') {
        const screen = await device.describe().catch(() => '');

        proofs.set(
          walking.step.numberInCase,
          provableProof({
            proof: proofWithValues({
              proof: report.proof,
              values: expectedValuesOf(walking.step.expected),
              screen,
            }),
            screen,
            values: this.values,
          }),
        );
      }

      if (report.verdict === 'failed' && report.title.length > 0)
        props.filed.push(report.title);

      if (report.verdict !== 'passed') hasFailed = true;

      if (
        report.verdict === 'blocked' ||
        (report.verdict === 'failed' && !report.goesOn)
      ) {
        this.unwalked({ pending, verdict: 'skipped', reason: 'skipped' });

        return endCase('Filed. The case stops here because this step did not hold up.');
      }

      const next = pending[0];

      if (next === undefined && hasFailed)
        return endCase('Filed. That was the last step of this case.');

      if (next === undefined) {
        const recipe = recipeOf({
          steps: props.steps.map(({ step }) => step),
          targetKind: this.target.kind,
          actions,
          proofs,
          runId: this.runId,
          at,
        });

        if (recipe !== null) props.recorded.push(recipe);

        return endCase('Filed. That was the last step of this case.');
      }

      if (this.isStopped) return 'The run was stopped: end your turn now.';

      began = Date.now();
      this.onEvent({ kind: 'doing', index: next.index, at: began });

      return report.verdict === 'failed'
        ? `Filed as a bug. The action went through, so the case goes on. Next is step ${String(next.step.numberInCase)}: ${next.step.action}`
        : `Filed. Next is step ${String(next.step.numberInCase)}: ${next.step.action}`;
    };

    let findings = 0;

    const onFinding = async (finding: IStepFinding): Promise<string> => {
      const walking = pending[0];

      if (walking === undefined || isOver) return 'This case is over: end your turn now.';

      findings += 1;
      props.filed.push(finding.title);

      const kept = keptBugId({ asked: finding.sameAs, known: this.bugs });
      const shot = await this.driver.shoot(
        join(
          this.shotDir,
          `finding-${String(walking.index + 1)}-${String(findings)}.jpg`,
        ),
      );

      this.onEvent({
        kind: 'finding',
        finding: {
          ...finding,
          sameAs: kept ?? undefined,
          caseId: walking.step.caseId,
          stepNumber: walking.step.numberInCase,
          index: walking.index,
          action: walking.step.action,
          at: Date.now(),
          screenshot: shot?.dataUrl ?? null,
          shotFile: shot?.file ?? null,
        },
      });

      return findingAnswer({
        asked: finding.sameAs,
        kept,
        carryOn: stepCarryOn(walking.step.numberInCase),
      });
    };

    const onAsk = async (question: IQaQuestion): Promise<string> => {
      if (pending[0] === undefined || isOver)
        return 'This case is over: end your turn now.';

      const asking = pending[0];
      const shot = await this.driver
        .shoot(join(this.shotDir, `step-${String(asking.index + 1)}.jpg`))
        .catch(() => null);

      this.unwalked({
        pending,
        verdict: 'skipped',
        reason: 'asked',
        why: `${UNWALKED.asked} ${question.question}`,
        shotFile: shot?.file ?? null,
        asked: {
          question: question.question,
          options: question.options,
          screen: question.screen,
          secret: question.secret?.name ?? null,
        },
      });

      return endCase(
        'No one answers in this run, so the case stops here: end your turn now.',
      );
    };

    const port: IDevicePort = {
      describe: () => device.describe(),
      inspect: (target) => device.inspect(target),
      failedCalls: () => device.failedCalls(),
      calls: (ask) => device.calls(ask),
      glance: () => device.glance(),
      motion: () => device.motion(),
      act: async (action) => {
        await device.act(action);

        const walking = pending[0];

        if (walking !== undefined)
          actions.set(walking.step.numberInCase, [
            ...(actions.get(walking.step.numberInCase) ?? []),
            recordedAction({
              action,
              found: this.driver.resolution?.() ?? null,
              values: this.values,
            }),
          ]);
      },
    };
    const first = pending[0];

    if (first !== undefined)
      this.onEvent({ kind: 'doing', index: first.index, at: began });

    const screen = await device.describe().catch(() => '');

    if (this.isStopped) return { kind: 'stopped' };

    const turn = agent.walk({
      scope: this.scope,
      systemPrompt: this.harness.run({
        target: this.target,
        viewport: this.viewport,
        language: this.language,
      }),
      prompt: this.harness.walk({
        steps: pending.map(({ step }) => step),
        screen,
        language: this.language,
        filed: [...props.filed],
        known: this.bugs,
        variables: this.values.map(({ name, description }) => ({ name, description })),
        design: null,
        told: this.answers.filter(({ caseId }) => caseId === first?.step.caseId),
      }),
      device: { workspaceId: this.scope, driver: port, onReport, onFinding, onAsk },
      allowedTools: this.harness.toolsFor('runner').allowedTools,
    });
    const raced = await Promise.race([turn, caseOver]);
    const ended =
      raced ??
      (await Promise.race([
        turn,
        new Promise<null>((wake) => setTimeout(() => wake(null), RUN_WALK.costsWaitMs)),
      ]));

    if (ended?.costUsd !== null && ended?.costUsd !== undefined)
      this.onEvent({ kind: 'cost', costUsd: ended.costUsd });

    if (this.isStopped) return { kind: 'stopped' };

    if (isOver || raced === null) return { kind: 'walked' };

    if (raced.kind === 'capped') {
      this.isCapped = true;
      this.unwalked({ pending, verdict: 'skipped', reason: 'capped' });

      return { kind: 'walked' };
    }

    if (raced.kind === 'failed') {
      this.unwalked({ pending, verdict: 'blocked', reason: null, why: raced.reason });

      return { kind: 'failed', reason: raced.reason };
    }

    this.unwalked({ pending, verdict: 'blocked', reason: 'unreported' });

    return { kind: 'walked' };
  }

  /**
   * Anda um caso de novo sem o agente, do jeito que a gravação diz, conferindo a prova de
   * cada passo; os passos só são contados quando o caso inteiro valeu.
   */
  private async replayCase(props: {
    steps: IIndexedStep[];
    recipe: ICaseRecipe;
  }): Promise<'replayed' | 'diverged' | 'stopped'> {
    const outcomes: IStepOutcome[] = [];
    const device = variablePort({ device: this.driver, values: this.values });

    for (const { step, index } of props.steps) {
      if (this.isStopped) return 'stopped';

      const kept = props.recipe.steps.find(({ number }) => number === step.numberInCase);

      if (kept === undefined) return 'diverged';

      const began = Date.now();

      this.onEvent({ kind: 'doing', index, at: began });

      const isDone = await (async () => {
        for (const action of kept.actions) await device.act(action);
      })().then(
        () => true,
        () => false,
      );

      if (!isDone || !(await this.proofShows({ device, proof: kept.proof })))
        return 'diverged';

      const shot = await this.driver.shoot(
        join(this.shotDir, `step-${String(index + 1)}.jpg`),
      );
      const at = Date.now();

      outcomes.push(
        replayedOutcome({
          step,
          index,
          workspaceId: this.scope,
          proof: kept.proof,
          tookMs: at - began,
          at,
          shot,
        }),
      );
    }

    for (const outcome of outcomes) this.onEvent({ kind: 'step', outcome });

    return 'replayed';
  }

  private async proofShows(props: {
    device: IDevicePort;
    proof: string;
  }): Promise<boolean> {
    for (let tries = 0; tries < RUN_WALK.proofChecks; tries += 1) {
      const screen = await props.device.describe().catch(() => '');

      if (proofHolds({ screen, proof: props.proof })) return true;

      await new Promise((wake) => setTimeout(wake, RUN_WALK.proofWaitMs));
    }

    return false;
  }

  /**
   * Resolve os passos que um caso nunca alcançou: o primeiro como o `verdict` diz e por
   * quê, o resto pulado depois dele.
   */
  private unwalked(props: {
    pending: IIndexedStep[];
    verdict: 'skipped' | 'blocked';
    reason: UnwalkedReason | null;
    why?: string;
    shotFile?: string | null;
    asked?: IStepAsked;
  }): void {
    const at = Date.now();
    const why =
      props.why ?? (props.reason === null ? UNWALKED.skipped : UNWALKED[props.reason]);

    for (const [position, { step, index }] of props.pending.entries())
      this.onEvent({
        kind: 'step',
        outcome: unwalkedOutcome({
          step,
          index,
          workspaceId: this.scope,
          verdict: position === 0 ? props.verdict : 'skipped',
          why: position === 0 ? why : UNWALKED.skipped,
          reason: position === 0 ? props.reason : 'skipped',
          at,
          ...(position === 0 ? { shotFile: props.shotFile, asked: props.asked } : {}),
        }),
      });

    props.pending.length = 0;
  }
}
