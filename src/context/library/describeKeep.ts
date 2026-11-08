import type { IHarnessSection } from '@/context/types';
import type { KeepEvent } from '@/contract';
import type { IKeepBrief } from '@/types';

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
          : brief.memories.map(
              ({ id, scope, target, text }) => `- [${id}] (${scope}, ${target}) ${text}`,
            ),
    },
    { title: 'What just happened', lines: brief.events.flatMap(linesOf) },
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
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .split('\n')
    .map((line) => `  ${line}`);
}
