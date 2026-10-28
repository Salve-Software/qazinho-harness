/**
 * Como um caso foi pelo jeito que os passos foram: falhou quando um falhou, senão
 * bloqueado quando um foi, senão pulado quando um foi, senão passou.
 */
export function caseVerdictOf(
  verdicts: ('passed' | 'failed' | 'blocked' | 'skipped')[],
): 'passed' | 'failed' | 'blocked' | 'skipped' {
  if (verdicts.includes('failed')) return 'failed';

  if (verdicts.includes('blocked')) return 'blocked';

  if (verdicts.includes('skipped') || verdicts.length === 0) return 'skipped';

  return 'passed';
}
