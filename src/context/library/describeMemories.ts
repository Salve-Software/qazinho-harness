import type { IMemoryBrief } from '@/contract';
import { MEMORY_WORDS } from '@/constants';
import { memoryLineOf } from './memoryLineOf';

/**
 * O que o QAzinho já aprendeu sobre o app, como o agente de uma run o lê, com as que o QA
 * já ouviu nesta run marcadas; nada quando não há.
 */
export function describeMemories(props: {
  memories: IMemoryBrief[];
  heard?: string[];
}): string[] {
  const heard = new Set(props.heard ?? []);

  return props.memories.length === 0
    ? []
    : [
        '',
        MEMORY_WORDS.lead,
        ...props.memories.map(
          ({ id, text }) =>
            `- [${id}] ${memoryLineOf(text)}${heard.has(id) ? MEMORY_WORDS.heard : ''}`,
        ),
        MEMORY_WORDS.walk,
      ];
}
