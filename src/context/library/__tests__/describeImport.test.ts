import type { IImportSource } from '@/contract';
import { describe, expect, it } from 'vitest';
import { describeImport } from '@/context/library';

const SOURCE: IImportSource = {
  name: 'loja-e2e',
  dir: '/Users/qa/loja-e2e',
  frameworks: [{ id: 'playwright', files: 2 }],
  files: ['tests/cart.spec.ts', 'tests/login.spec.ts'],
  branch: 'main',
  commit: 'aaa1111222233334444',
};

describe('describeImport', () => {
  it('names the folder at its commit, what was recognized, and the test files', () => {
    expect(describeImport({ source: SOURCE, wasTold: false })).toEqual({
      title: 'The tests to import',
      lines: [
        'Folder loja-e2e, branch main at aaa1111.',
        'The tests are at /Users/qa/loja-e2e. Read them with your tools; it is read only, and it is closed once the plan is written.',
        'The QAzinho recognized: playwright (2 files). Confirm it by reading.',
        'Files that look like tests:',
        '  tests/cart.spec.ts',
        '  tests/login.spec.ts',
      ],
    });
  });

  it('asks the agent to find the framework when none was recognized', () => {
    const { lines } = describeImport({
      source: { ...SOURCE, frameworks: [], branch: null, commit: null },
      wasTold: false,
    });

    expect(lines[0]).toBe('Folder loja-e2e.');
    expect(lines[2]).toMatch(/did not recognize a test framework/);
  });

  it('counts the files it left out of the list', () => {
    const files = Array.from({ length: 83 }, (_, index) => `t/${String(index)}.spec.ts`);
    const { lines } = describeImport({ source: { ...SOURCE, files }, wasTold: false });

    expect(lines.at(-1)).toBe('  and 3 more.');
  });

  it('says nothing without a folder, unless it was told one before', () => {
    expect(describeImport({ source: null, wasTold: false }).lines).toEqual([]);
    expect(describeImport({ source: null, wasTold: true }).lines[0]).toMatch(
      /is closed now/,
    );
  });
});
