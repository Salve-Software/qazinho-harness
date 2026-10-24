import type { SourceCall } from '@/tools/servers/sources/types';
import { describe, expect, it } from 'vitest';
import { callSourceTool } from '@/tools/servers/sources/library';

describe('callSourceTool', () => {
  it('hands a call that reads to whoever fetches, and answers with what came back', async () => {
    const asked: SourceCall[] = [];
    const answer = await callSourceTool({
      sources: {
        scope: 'chat~w-1',
        fetch: (call) => {
          asked.push(call);

          return Promise.resolve({ text: '## The Jira story\nHC-878', isError: false });
        },
      },
      call: { name: 'read_jira_story', args: { story: 'HC-878' } },
    });

    expect(asked).toEqual([{ name: 'read_jira_story', key: 'HC-878' }]);
    expect(answer).toEqual({
      content: [{ type: 'text', text: '## The Jira story\nHC-878' }],
      isError: false,
    });
  });

  it('does NOT fetch a call it refused, and says why a fetch broke', async () => {
    const fetchNothing = {
      scope: 's',
      fetch: () => Promise.reject(new Error('socket hang up')),
    };

    expect(
      await callSourceTool({
        sources: fetchNothing,
        call: { name: 'read_jira_story', args: {} },
      }),
    ).toMatchObject({ isError: true });
    expect(
      await callSourceTool({
        sources: fetchNothing,
        call: { name: 'search_confluence', args: { query: 'tabs' } },
      }),
    ).toEqual({
      content: [{ type: 'text', text: 'QAzinho could not fetch it: socket hang up' }],
      isError: true,
    });
  });
});
