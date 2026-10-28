import type { IWalkLog, ICatch } from '@/engine/runner/types';

/**
 * Todo passo que falhou e todo bug visto ao lado de um num walk, na ordem em que vieram.
 */
export function catchesOf(log: IWalkLog): ICatch[] {
  return [
    ...log.outcomes
      .filter(({ verdict }) => verdict === 'failed')
      .map((outcome) => ({
        index: outcome.index,
        caseId: outcome.caseId,
        stepNumber: outcome.stepNumber,
        action: outcome.action,
        title: outcome.title,
        severity: outcome.severity,
        why: outcome.why,
        expected: outcome.expected,
        got: outcome.got,
        shotFile: outcome.shotFile,
        at: outcome.at,
        sameAs: outcome.sameAs,
        isIncidental: false,
      })),
    ...log.findings.map((finding) => ({
      index: finding.index,
      caseId: finding.caseId,
      stepNumber: finding.stepNumber,
      action: finding.action,
      title: finding.title,
      severity: finding.severity,
      why: finding.got,
      expected: finding.expected,
      got: finding.got,
      shotFile: finding.shotFile,
      at: finding.at,
      sameAs: finding.sameAs,
      isIncidental: true,
    })),
  ].sort((one, other) => one.at - other.at);
}
