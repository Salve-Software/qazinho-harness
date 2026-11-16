import type { OutsideCaller, OutsideToolCall } from '@/contract';
import { describe, expect, it } from 'vitest';
import { callOutsideTool } from '@/tools/servers/outside/library';

describe('callOutsideTool', () => {
  it('hands the app the call as read and who called, and answers with what it did', async () => {
    const calls: OutsideToolCall[] = [];
    const callers: OutsideCaller[] = [];
    const answer = await callOutsideTool({
      perform: (call, caller) => {
        calls.push(call);
        callers.push(caller);

        return Promise.resolve({ text: 'Started r-01.', isError: false });
      },
      call: { name: 'start_run', args: { workspace: '  Compra  ' } },
      caller: 'claude-code',
    });

    expect(calls).toEqual([{ name: 'start_run', args: { workspace: 'Compra' } }]);
    expect(callers).toEqual(['claude-code']);
    expect(answer).toEqual({
      content: [{ type: 'text', text: 'Started r-01.' }],
      isError: false,
    });
  });

  it('never reaches the app with a call it refuses', async () => {
    const calls: OutsideToolCall[] = [];
    const answer = await callOutsideTool({
      perform: (call) => {
        calls.push(call);

        return Promise.resolve({ text: '', isError: false });
      },
      call: { name: 'approve_permission', args: {} },
      caller: 'codex',
    });

    expect(calls).toEqual([]);
    expect(answer.isError).toBe(true);
  });

  it('says it could not do it when the app throws', async () => {
    const answer = await callOutsideTool({
      perform: () => Promise.reject(new Error('the page went away')),
      call: { name: 'list_workspaces', args: {} },
      caller: 'other',
    });

    expect(answer).toEqual({
      content: [{ type: 'text', text: 'QAzinho could not do it: the page went away' }],
      isError: true,
    });
  });
});
