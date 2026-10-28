import type { ISuiteTestsCall } from '@/tools/servers/suite/types';
import { describe, expect, it } from 'vitest';
import { callSuiteTool } from '@/tools/servers/suite/library';

/**
 * Quem roda os testes, aqui uma lista que lembra cada chamada e responde o que mandam.
 */
function fakeSuite(runTests: () => Promise<{ text: string; isError: boolean }>) {
  const calls: ISuiteTestsCall[] = [];

  return {
    calls,
    suite: {
      scope: '~change:c-01',
      runTests: (call: ISuiteTestsCall) => {
        calls.push(call);

        return runTests();
      },
    },
  };
}

describe('callSuiteTool', () => {
  it('runs the tests asked for, and answers with how they went', async () => {
    const { suite, calls } = fakeSuite(() =>
      Promise.resolve({ text: 'CT-NAV-002 passed.', isError: false }),
    );

    expect(
      await callSuiteTool({
        suite,
        call: { name: 'run_tests', args: { tests: ['tests/a.spec.ts:4'] } },
      }),
    ).toEqual({
      content: [{ type: 'text', text: 'CT-NAV-002 passed.' }],
      isError: false,
    });
    expect(calls).toEqual([{ tests: ['tests/a.spec.ts:4'], project: '' }]);
  });

  it('does NOT run a call that breaks the schema, and the agent reads why', async () => {
    const { suite, calls } = fakeSuite(() =>
      Promise.resolve({ text: '', isError: false }),
    );

    expect(
      await callSuiteTool({ suite, call: { name: 'run_tests', args: { tests: 'all' } } }),
    ).toMatchObject({ isError: true });
    expect(calls).toEqual([]);
  });

  it('answers a run that threw as an error the agent acts on', async () => {
    const { suite } = fakeSuite(() => Promise.reject(new Error('Playwright is gone')));

    expect(
      await callSuiteTool({
        suite,
        call: { name: 'run_tests', args: { tests: ['tests/a.spec.ts'] } },
      }),
    ).toEqual({
      content: [{ type: 'text', text: 'QAzinho could not run them: Playwright is gone' }],
      isError: true,
    });
  });
});
