import type { IHarnessSection } from '@/context/types';
import type { IMemoryBrief } from '@/contract';
import { MEMORY_WORDS } from '@/constants';

/** O que o QAzinho já aprendeu sobre o app, como o agente do chat o lê. */
export function describeChatMemories(memories: IMemoryBrief[]): IHarnessSection {
  return {
    title: MEMORY_WORDS.title,
    lines:
      memories.length === 0
        ? []
        : [...memories.map(({ text }) => `- ${text}`), MEMORY_WORDS.chat],
  };
}
