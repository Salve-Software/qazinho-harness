import { describe, expect, it } from 'vitest';
import { changedSections } from '@/context/library';

const PLAN = { title: 'This workspace', lines: ['The workspace has no plan yet.'] };
const RUNS = { title: 'Runs in this workspace', lines: ['run r-01 · The whole plan'] };
const NO_RUNS = { title: 'Runs in this workspace', lines: [] };

describe('changedSections', () => {
  it('tells a new session every section that has something to say', () => {
    const { changed, told } = changedSections({ sections: [PLAN, RUNS], told: {} });

    expect(changed).toEqual([PLAN, RUNS]);
    expect(told).toEqual({
      'This workspace': 'The workspace has no plan yet.',
      'Runs in this workspace': 'run r-01 · The whole plan',
    });
  });

  it('does not tell again what the agent already read as it is', () => {
    const first = changedSections({ sections: [PLAN, NO_RUNS], told: {} });

    expect(changedSections({ sections: [PLAN, RUNS], told: first.told }).changed).toEqual(
      [RUNS],
    );
  });

  it('tells a section again once it changed', () => {
    const first = changedSections({ sections: [RUNS], told: {} });
    const later = { ...RUNS, lines: ['run r-02 · TC-03', 'run r-01 · The whole plan'] };

    expect(changedSections({ sections: [later], told: first.told }).changed).toEqual([
      later,
    ]);
  });

  it('never sends an empty section, and leaves what was told untouched', () => {
    const told = { 'This workspace': 'old' };
    const result = changedSections({ sections: [NO_RUNS], told });

    expect(result.changed).toEqual([]);
    expect(told).toEqual({ 'This workspace': 'old' });
  });
});
