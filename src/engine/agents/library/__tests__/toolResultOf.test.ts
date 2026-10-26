import { describe, expect, it } from 'vitest';
import { toolResultOf } from '@/engine/agents';

describe('toolResultOf', () => {
  it('turns the words and the screen into the result of the call', () => {
    expect(
      toolResultOf({
        id: 't1',
        answer: {
          content: [
            { type: 'text', text: 'Done.' },
            { type: 'image', data: 'AAAA', mimeType: 'image/png' },
          ],
          isError: false,
        },
      }),
    ).toEqual({
      type: 'tool_result',
      tool_use_id: 't1',
      content: [
        { type: 'text', text: 'Done.' },
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: 'AAAA' },
        },
      ],
      is_error: false,
    });
  });

  it('marks an answer the tools refused as an error', () => {
    expect(
      toolResultOf({
        id: 't2',
        answer: { content: [{ type: 'text', text: 'No target.' }], isError: true },
      }).is_error,
    ).toBe(true);
  });
});
