import type { OutsideToolCall } from '@/contract';
import type { OutsideToolRead } from '@/tools/servers/outside/types';
import { OUTSIDE_TOOLS } from '@/tools/servers/outside/constants';

/**
 * Lê a chamada de um agente de fora contra o schema da ferramenta; uma ferramenta que não
 * é oferecida a ele, ou uma chamada que quebra o schema, é recusada com o motivo.
 */
export function readOutsideToolCall(props: {
  name: string;
  args: Record<string, unknown> | undefined;
}): OutsideToolRead {
  const tool = OUTSIDE_TOOLS.find(({ name }) => name === props.name);

  if (!tool)
    return { kind: 'refused', error: `There is no tool called "${props.name}".` };

  const read = tool.input.safeParse(props.args ?? {});

  if (!read.success)
    return { kind: 'refused', error: read.error.issues[0]?.message ?? 'Call it again.' };

  return { kind: 'call', call: { name: tool.name, args: read.data } as OutsideToolCall };
}
