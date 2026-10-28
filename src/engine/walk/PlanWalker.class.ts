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
  IRecipeBook,
  IStepAction,
  IStepOutcome,
  ITargetUnderTest,
  IViewport,
  Language,
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
  outcomeOfReport,
  proofHolds,
  proofWithValues,
  recipeFor,
  recipeOf,
  recordedAction,
  replayedOutcome,
  stepCarryOn,
  unwalkedOutcome,
  variablePort,
} from './library';

/**
 * Walks a plan's cases on one device, each on the app opened anew: from its recording
 * with no agent where one holds, by the agent where not.
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
    this.shotDir = props.shotDir;
    this.onEvent = props.onEvent;
  }

  /**
   * Walks every case in order the way `mode` says, and answers with the recordings the
   * agent made and why the walk broke off, if it did.
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
          why: this.isCapped ? UNWALKED.capped : UNWALKED.noAgent,
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
   * Stops the walk: the case under way ends with its agent's turn, and no other case
   * starts.
   */
  public stop(): void {
    this.isStopped = true;
    this.agent?.cancel(this.scope);
  }

  /**
   * One agent turn on one case, kept as a recording once every step passed with its
   * proof; a question for the QA ends the case, since no one answers.
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
        const values = expectedValuesOf(walking.step.expected);

        proofs.set(
          walking.step.numberInCase,
          values.length === 0
            ? report.proof
            : proofWithValues({
                proof: report.proof,
                values,
                screen: await device.describe().catch(() => ''),
              }),
        );
      }

      if (report.verdict === 'failed' && report.title.length > 0)
        props.filed.push(report.title);

      if (report.verdict !== 'passed') {
        this.unwalked({ pending, verdict: 'skipped', why: UNWALKED.skipped });

        return endCase('Filed. The case stops here because this step did not hold up.');
      }

      const next = pending[0];

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

      return `Filed. Next is step ${String(next.step.numberInCase)}: ${next.step.action}`;
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

      this.unwalked({
        pending,
        verdict: 'skipped',
        why: `${UNWALKED.asked} ${question.question}`,
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
      this.unwalked({ pending, verdict: 'skipped', why: UNWALKED.capped });

      return { kind: 'walked' };
    }

    if (raced.kind === 'failed') {
      this.unwalked({ pending, verdict: 'blocked', why: raced.reason });

      return { kind: 'failed', reason: raced.reason };
    }

    this.unwalked({ pending, verdict: 'blocked', why: UNWALKED.unreported });

    return { kind: 'walked' };
  }

  /**
   * Walks a case again without the agent, the way its recording says, checking each
   * step's proof; its steps are told only once the whole case held.
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
   * Settles the steps a case never reached: the first as `verdict` says and why, the rest
   * skipped after it.
   */
  private unwalked(props: {
    pending: IIndexedStep[];
    verdict: 'skipped' | 'blocked';
    why: string;
  }): void {
    const at = Date.now();

    for (const [position, { step, index }] of props.pending.entries())
      this.onEvent({
        kind: 'step',
        outcome: unwalkedOutcome({
          step,
          index,
          workspaceId: this.scope,
          verdict: position === 0 ? props.verdict : 'skipped',
          why: position === 0 ? props.why : UNWALKED.skipped,
          at,
        }),
      });

    props.pending.length = 0;
  }
}
