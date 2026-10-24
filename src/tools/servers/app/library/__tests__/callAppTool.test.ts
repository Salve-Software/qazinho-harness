import type { AppToolCall } from '@/contract';
import { describe, expect, it } from 'vitest';
import { callAppTool } from '@/tools/servers/app/library';

/** Whoever performs the calls, here a list that remembers them and answers what it is told to. */
function fakeApp(
  perform: (call: AppToolCall) => Promise<{ text: string; isError: boolean }>,
) {
  const calls: AppToolCall[] = [];

  return {
    calls,
    app: {
      scope: '~assistant',
      perform: (call: AppToolCall) => {
        calls.push(call);

        return perform(call);
      },
    },
  };
}

describe('callAppTool', () => {
  it('hands a call that fits its schema on, and answers with what was done', async () => {
    const { app, calls } = fakeApp(() =>
      Promise.resolve({ text: 'Renamed w-1 to "Checkout".', isError: false }),
    );

    expect(
      await callAppTool({
        app,
        call: { name: 'rename_workspace', args: { workspace: 'w-1', name: 'Checkout' } },
      }),
    ).toEqual({
      content: [{ type: 'text', text: 'Renamed w-1 to "Checkout".' }],
      isError: false,
    });
    expect(calls).toEqual([
      { name: 'rename_workspace', args: { workspace: 'w-1', name: 'Checkout' } },
    ]);
  });

  it('passes on what the page could not do as an error the agent acts on', async () => {
    const { app } = fakeApp(() =>
      Promise.resolve({ text: 'There is no workspace "Nope".', isError: true }),
    );

    expect(
      await callAppTool({ app, call: { name: 'run_plan', args: { workspace: 'Nope' } } }),
    ).toMatchObject({ isError: true });
  });

  it('does NOT hand on a call that breaks the schema', async () => {
    const { app, calls } = fakeApp(() => Promise.resolve({ text: '', isError: false }));

    expect(
      await callAppTool({ app, call: { name: 'delete_project', args: {} } }),
    ).toEqual({
      content: [
        { type: 'text', text: '"delete_project" needs "project": its id or its name.' },
      ],
      isError: true,
    });
    expect(calls).toEqual([]);
  });

  it('turns a page that throws into an error answer, not a crash', async () => {
    const { app } = fakeApp(() => Promise.reject(new Error('The window closed.')));

    expect(await callAppTool({ app, call: { name: 'go_home', args: {} } })).toEqual({
      content: [{ type: 'text', text: 'QAzinho could not do it: The window closed.' }],
      isError: true,
    });
  });
});
