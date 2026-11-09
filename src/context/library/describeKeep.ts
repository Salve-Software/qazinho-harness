import type { IHarnessSection } from '@/context/types';
import type { IMemoryBrief, KeepEvent } from '@/contract';
import type { IKeepBrief } from '@/types';
import { KEEP_LIMIT } from '@/constants';
import { MEMORY_LIMIT } from '@/contract';
import { memoryLineOf } from './memoryLineOf';

const SCOPES = ['project', 'plan'] as const;

/**
 * Como o agente lê o que decide guardar: as memórias de agora, cada uma com o id dela, e
 * o que acabou de acontecer, com as palavras de fora indentadas.
 */
export function describeKeep(brief: IKeepBrief): IHarnessSection[] {
  return [
    {
      title: 'What QAzinho keeps now',
      lines:
        brief.memories.length === 0
          ? ['Nothing yet.']
          : [
              ...brief.memories.map(
                ({ id, scope, target, text }) =>
                  `- [${id}] (${scope}, ${target}) ${memoryLineOf(text)}`,
              ),
              ...SCOPES.flatMap((scope) =>
                fullLinesOf({ memories: brief.memories, scope }),
              ),
            ],
    },
    {
      title: 'What just happened',
      lines: brief.events.slice(-KEEP_LIMIT.events).flatMap(linesOf),
    },
  ];
}

function fullLinesOf(props: {
  memories: IMemoryBrief[];
  scope: (typeof SCOPES)[number];
}): string[] {
  const { memories, scope } = props;
  const count = memories.filter((one) => one.scope === scope).length;
  const limit = MEMORY_LIMIT[scope];

  return count < limit
    ? []
    : [
        `The ${scope} memories are full (${count} of ${limit}). To add one more of them, make room in the same answer: join two on the same subject with replace and delete the other, or delete the one that will help the least.`,
      ];
}

function linesOf(event: KeepEvent): string[] {
  if (event.kind === 'said') return ['The QA said:', ...quoted(event.text)];

  if (event.kind === 'walked')
    return ['The agent said, while walking the app:', ...quoted(event.text)];

  return [
    'The agent asked the QA:',
    ...quoted(event.question),
    'The QA answered:',
    ...quoted(event.answer),
  ];
}

function quoted(text: string): string[] {
  return text
    .slice(0, KEEP_LIMIT.eventChars)
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .split('\n')
    .map((line) => `  ${line}`);
}
