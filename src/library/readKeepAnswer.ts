import type { IMemoryBrief, MemoryOp } from '@/contract';
import { MEMORY_LIMIT } from '@/contract';
import { KEEP_ANSWER } from '@/schemas/KEEP_ANSWER';

/**
 * As mudanças que o agente pediu, conferidas contra o schema e as memórias que leu; null
 * quando não é uma resposta. A que nomeia uma que ele não leu, ou passa do tamanho, sai.
 */
export function readKeepAnswer(props: {
  text: string;
  memories: IMemoryBrief[];
}): MemoryOp[] | null {
  try {
    const read = KEEP_ANSWER.safeParse(JSON.parse(props.text));

    if (!read.success) return null;

    const known = new Set(props.memories.map(({ id }) => id));
    const kept: MemoryOp[] = [];

    for (const asked of read.data.ops) {
      const text = asked.text?.trim() ?? '';
      const id = asked.id?.trim() ?? '';
      const isTaken = kept.some((one) => one.op !== 'add' && one.id === id);
      const fits = text !== '' && text.length <= MEMORY_LIMIT.chars;

      if (asked.op === 'add' && fits)
        kept.push({
          op: 'add',
          text,
          scope: asked.scope ?? 'project',
          target: asked.target ?? 'all',
        });
      else if (asked.op === 'replace' && known.has(id) && !isTaken && fits)
        kept.push({
          op: 'replace',
          id,
          text,
          ...(asked.target == null ? {} : { target: asked.target }),
        });
      else if (asked.op === 'delete' && known.has(id) && !isTaken)
        kept.push({ op: 'delete', id });
    }

    return kept;
  } catch {
    return null;
  }
}
