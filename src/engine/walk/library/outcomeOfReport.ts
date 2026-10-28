import type { IFlatStep, IStepOutcome } from '@/contract';
import type { IShot } from '@/engine/devices/types';
import type { IStepReport } from '@/tools/servers/device/types';

/**
 * Um passo como a run o registra: o relato do agente, a captura feita quando ele chegou,
 * o tempo que levou e quando veio; uma falha guarda o frame do Figma de que destoa.
 */
export function outcomeOfReport(props: {
  report: IStepReport;
  step: IFlatStep;
  index: number;
  workspaceId: string;
  tookMs: number;
  at: number;
  shot: IShot | null;
}): IStepOutcome {
  const { report, step, index, workspaceId, tookMs, at, shot } = props;

  return {
    workspaceId,
    caseId: step.caseId,
    stepNumber: step.numberInCase,
    index,
    action: step.action,
    expected: step.expected,
    verdict: report.verdict,
    why: report.why,
    got: report.got,
    title: report.title,
    severity: report.severity,
    tookMs,
    at,
    screenshot: shot?.dataUrl ?? null,
    shotFile: shot?.file ?? null,
    ...(report.sameAs === undefined ? {} : { sameAs: report.sameAs }),
    ...(report.verdict === 'failed' && report.frame !== undefined
      ? { frame: report.frame }
      : {}),
  };
}
