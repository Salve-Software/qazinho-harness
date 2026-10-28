import { describe, expect, it } from 'vitest';
import { readSuiteToolCall } from '@/tools/servers/suite/library';

describe('readSuiteToolCall', () => {
  it('reads the tests to run, trimmed, in every project when none is named', () => {
    expect(
      readSuiteToolCall({
        name: 'run_tests',
        args: { tests: [' tests/hc-1/ct-nav.spec.ts:12 ', 'tests/hc-2/a.spec.ts'] },
      }),
    ).toEqual({
      kind: 'call',
      call: {
        tests: ['tests/hc-1/ct-nav.spec.ts:12', 'tests/hc-2/a.spec.ts'],
        project: '',
      },
    });
  });

  it('keeps the Playwright project named', () => {
    expect(
      readSuiteToolCall({
        name: 'run_tests',
        args: { tests: ['tests/a.spec.ts'], project: 'salva-versao' },
      }),
    ).toMatchObject({ call: { project: 'salva-versao' } });
  });

  it('refuses a call with no test, and says why', () => {
    expect(readSuiteToolCall({ name: 'run_tests', args: { tests: [] } })).toEqual({
      kind: 'refused',
      error: '"run_tests" needs at least one test in "tests".',
    });
    expect(readSuiteToolCall({ name: 'run_tests', args: {} })).toMatchObject({
      kind: 'refused',
    });
  });

  /**
   * A ferramenta roda o Playwright a partir da pasta da suíte: um caminho que sobe para
   * fora dela chegaria aos arquivos do próprio QA.
   */
  it('refuses a test outside the suite folder', () => {
    for (const test of [
      '../app/a.spec.ts',
      '/Users/qa/a.spec.ts',
      'tests/../../x.spec.ts',
    ])
      expect(
        readSuiteToolCall({ name: 'run_tests', args: { tests: [test] } }),
      ).toMatchObject({ kind: 'refused' });
  });

  it('refuses a tool that does not exist', () => {
    expect(readSuiteToolCall({ name: 'rm', args: {} })).toEqual({
      kind: 'refused',
      error: 'There is no tool called "rm".',
    });
  });
});
