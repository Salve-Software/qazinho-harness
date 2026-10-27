import type { IFlatStep, IStepOutcome } from '@/contract';
import type { IShot } from '@/engine/devices/types';
import type { IStepReport } from '@/tools/servers/device/types';

/**
 * A step as the run files it: the agent's report, the screenshot taken when it arrived,
 * the time it took and when it came; a failure keeps the Figma frame it is off.
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
