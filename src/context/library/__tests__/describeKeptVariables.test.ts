import { describe, expect, it } from 'vitest';
import { describeKeptVariables } from '@/context/library';

describe('describeKeptVariables', () => {
  it('lists each variable by its ${NAME} and what it holds', () => {
    expect(
      describeKeptVariables([
        { name: 'LOGIN_EMAIL', description: 'The admin on staging' },
        { name: 'TOKEN', description: '' },
      ]),
    ).toEqual({
      title: "The project's variables",
      lines: [
        'The project keeps these. A step names one as ${NAME}, and no one reads a value back:',
        '- ${LOGIN_EMAIL}: The admin on staging',
        '- ${TOKEN}',
      ],
    });
  });

  it('says so when the project keeps none, so the agent knows to ask', () => {
    expect(describeKeptVariables([]).lines).toEqual([
      'The project keeps no variables yet.',
    ]);
  });
});
