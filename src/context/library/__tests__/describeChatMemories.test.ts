import { describe, expect, it } from 'vitest';
import { describeChatMemories } from '@/context/library/describeChatMemories';

describe('describeChatMemories', () => {
  it('has no lines when nothing was learned, so the section stays out', () => {
    expect(describeChatMemories([]).lines).toEqual([]);
  });

  it('lists what was learned and keeps it out of what a step expects', () => {
    const { lines } = describeChatMemories([
      { id: 'm-1', text: 'O SSO não funciona.', scope: 'project', target: 'all' },
    ]);

    expect(lines[0]).toBe('- O SSO não funciona.');
    expect(lines.join('\n')).toContain(
      'never write one into a plan as an expected result',
    );
  });
});
