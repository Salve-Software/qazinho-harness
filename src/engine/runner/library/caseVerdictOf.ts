/**
 * How a case went from how its steps did: failed when one failed, else blocked when one
 * was, else skipped when one was, else passed.
 */
export function caseVerdictOf(
  verdicts: ('passed' | 'failed' | 'blocked' | 'skipped')[],
): 'passed' | 'failed' | 'blocked' | 'skipped' {
  if (verdicts.includes('failed')) return 'failed';

  if (verdicts.includes('blocked')) return 'blocked';

  if (verdicts.includes('skipped') || verdicts.length === 0) return 'skipped';

  return 'passed';
}
