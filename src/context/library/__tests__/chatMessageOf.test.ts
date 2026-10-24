import { describe, expect, it } from 'vitest';
import { chatMessageOf } from '@/context/library';

describe('chatMessageOf', () => {
  it('opens the message with what QAzinho tells, before the QA words', () => {
    expect(
      chatMessageOf({
        sections: [{ title: 'Runs in this workspace', lines: ['run r-01'] }],
        text: 'What failed?',
      }),
    ).toBe('<qazinho>\n## Runs in this workspace\nrun r-01\n</qazinho>\n\nWhat failed?');
  });

  it('sends the QA words alone when there is nothing new to tell', () => {
    expect(
      chatMessageOf({
        sections: [{ title: 'What the QA pointed at', lines: [] }],
        text: 'And now?',
      }),
    ).toBe('And now?');
  });
});
