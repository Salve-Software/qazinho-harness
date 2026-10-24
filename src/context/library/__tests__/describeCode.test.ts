import type { ICodeCopy } from '@/contract';
import { describe, expect, it } from 'vitest';
import { describeCode } from '@/context/library';

const COPY: ICodeCopy = {
  repository: 'acme/loja-web',
  branch: 'feat/cupom',
  base: 'develop',
  commit: 'aaa1111222233334444',
  baseCommit: 'bbb2222333344445555',
  root: '/data/code/w-1',
  dir: '/data/code/w-1/acme/loja-web',
  diffFile: '/data/code/w-1/acme-loja-web.diff',
  changes: [
    { path: 'src/Coupon.tsx', status: 'modified', additions: 40, deletions: 3 },
    { path: 'src/couponRules.ts', status: 'added', additions: 120, deletions: 0 },
  ],
  changedFiles: 2,
  commits: 1,
};

describe('describeCode', () => {
  it('names the branch at its commit, where it sits, and every file it changed', () => {
    expect(describeCode({ code: COPY, wasTold: false })).toEqual({
      title: 'The code',
      lines: [
        'Repository acme/loja-web, branch feat/cupom at aaa1111.',
        'The code is at /data/code/w-1/acme/loja-web. Read it with your tools; it is read only, and it is deleted once the plan is written.',
        'Against develop at bbb2222: 1 commit, 2 files changed.',
        'The whole diff is at /data/code/w-1/acme-loja-web.diff.',
        'Changed files:',
        '  modified src/Coupon.tsx (+40 -3)',
        '  added src/couponRules.ts (+120 -0)',
      ],
    });
  });

  it('asks for the whole app when the branch is the base', () => {
    expect(
      describeCode({ code: { ...COPY, baseCommit: null, changes: [] }, wasTold: false })
        .lines,
    ).toContain(
      'This is the whole app on its base branch, with nothing to compare: plan across the app.',
    );
  });

  it('says the diff was too large, and how many files the list leaves out', () => {
    const { lines } = describeCode({
      code: { ...COPY, diffFile: null, changedFiles: 70, commits: 4 },
      wasTold: false,
    });

    expect(lines).toContain('Against develop at bbb2222: 4 commits, 70 files changed.');
    expect(lines).toContain(
      'The diff was too large for GitHub to hand over; read the changed files instead.',
    );
    expect(lines.at(-1)).toBe('  and 68 files more in the diff.');
  });

  it('tells the agent the copy is gone, once, when it had been told of one', () => {
    expect(describeCode({ code: null, wasTold: true }).lines).toHaveLength(1);
    expect(describeCode({ code: null, wasTold: false }).lines).toEqual([]);
  });
});
