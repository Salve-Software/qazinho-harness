import type { IFlatStep, IStepAsked, IStepOutcome, UnwalkedReason } from '@/contract';

/**
 * Um passo sem veredito próprio do agente: pulado depois de um passo que falhou, ou nunca
 * relatado, com o porquê em palavras e, quando é um dos conhecidos, o código dele.
 */
export function unwalkedOutcome(props: {
  step: IFlatStep;
  index: number;
  workspaceId: string;
  verdict: 'skipped' | 'blocked';
  why: string;
  reason: UnwalkedReason | null;
  at: number;
  shotFile?: string | null;
  asked?: IStepAsked;
}): IStepOutcome {
  const { step, index, workspaceId, verdict, why, reason, at } = props;

  return {
    workspaceId,
    caseId: step.caseId,
    stepNumber: step.numberInCase,
    index,
    action: step.action,
    expected: step.expected,
    verdict,
    why,
    got: '',
    title: '',
    severity: 'medium',
    tookMs: 0,
    at,
    screenshot: null,
    shotFile: props.shotFile ?? null,
    ...(reason === null ? {} : { unwalked: reason }),
    ...(props.asked === undefined ? {} : { asked: props.asked }),
  };
}
