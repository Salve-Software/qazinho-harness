import { describe, expect, it } from 'vitest';
import { caseVerdictOf } from '@/engine/runner/library';

describe('caseVerdictOf', () => {
  it('fails a case one step failed, whatever the rest did', () => {
    expect(caseVerdictOf(['passed', 'failed', 'skipped'])).toBe('failed');
  });

  it('blocks a case one step blocked, with none failed', () => {
    expect(caseVerdictOf(['passed', 'blocked'])).toBe('blocked');
  });

  it('skips a case one step skipped, or with no step at all', () => {
    expect(caseVerdictOf(['passed', 'skipped'])).toBe('skipped');
    expect(caseVerdictOf([])).toBe('skipped');
  });

  it('passes a case only when every step passed', () => {
    expect(caseVerdictOf(['passed', 'passed'])).toBe('passed');
  });
});
