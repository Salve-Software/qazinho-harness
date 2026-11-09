import type { IMemoryBrief, KeepEvent, MemoryOp } from '@/contract';
import { KEEP_LIMIT } from '@/constants';
import { MEMORY_LIMIT } from '@/contract';
import { KEEP_ANSWER } from '@/schemas/KEEP_ANSWER';

const VARIABLE_MENTION = /\$\{[^}]*\}/g;

/**
 * As mudanças que o agente pediu, conferidas contra o que ele leu; null quando não é uma
 * resposta. Sai a que cita uma memória ou variável que ele não leu, ou passa do tamanho.
 */
export function readKeepAnswer(props: {
  text: string;
  memories: IMemoryBrief[];
  events: KeepEvent[];
}): MemoryOp[] | null {
  try {
    const read = KEEP_ANSWER.safeParse(JSON.parse(props.text));

    if (!read.success) return null;

    const known = new Set(props.memories.map(({ id }) => id));
    const heard = JSON.stringify([props.memories, props.events]);
    const kept: MemoryOp[] = [];

    for (const asked of read.data.ops) {
      const text = (asked.text ?? '').replace(/\s+/g, ' ').trim();
      const id = asked.id?.trim() ?? '';
      const isTaken = kept.some((one) => one.op !== 'add' && one.id === id);
      const fits =
        text !== '' &&
        text.length <= MEMORY_LIMIT.chars &&
        (text.match(VARIABLE_MENTION) ?? []).every((name) => heard.includes(name));

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

    return kept.slice(0, KEEP_LIMIT.ops);
  } catch {
    return null;
  }
}
