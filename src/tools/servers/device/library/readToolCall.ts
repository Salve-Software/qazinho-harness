import type { DialogAnswer } from '@/contract';
import type { DeviceToolCall } from '@/tools/servers/device/types';
import { DEVICE_TOOLS } from '@/tools/servers/device/constants';
import { withoutStrayTags } from './withoutStrayTags';

/**
 * Lê uma chamada de ferramenta contra o schema da própria ferramenta; uma chamada que o
 * quebra é recusada com o motivo.
 */
export function readToolCall(props: {
  name: string;
  args: Record<string, unknown> | undefined;
}): DeviceToolCall {
  const tool = DEVICE_TOOLS.find(({ name }) => name === props.name);

  if (!tool)
    return { kind: 'refused', error: `There is no tool called "${props.name}".` };

  if (tool.name === 'report') {
    const read = tool.input.safeParse(props.args ?? {});

    if (!read.success)
      return { kind: 'refused', error: read.error.issues[0]?.message ?? 'Report again.' };

    return {
      kind: 'report',
      report: {
        ...cleaned(read.data),
        title: withoutStrayTags(read.data.title ?? ''),
        severity: read.data.severity ?? 'medium',
        goesOn: read.data.goesOn ?? false,
        note: withoutStrayTags(read.data.note ?? ''),
        proof: withoutStrayTags(read.data.proof ?? ''),
      },
    };
  }

  if (tool.name === 'bug') {
    const read = tool.input.safeParse(props.args ?? {});

    if (!read.success)
      return {
        kind: 'refused',
        error: read.error.issues[0]?.message ?? 'File it again.',
      };

    return { kind: 'finding', finding: cleaned(read.data) };
  }

  if (tool.name === 'ask_qa') {
    const read = tool.input.safeParse(props.args ?? {});

    if (!read.success)
      return { kind: 'refused', error: read.error.issues[0]?.message ?? 'Ask again.' };

    const { question, screen, options, secret } = read.data;

    return {
      kind: 'ask',
      question: {
        question,
        screen: screen === undefined || screen === '' ? null : screen,
        options: secret === undefined ? [...new Set(options ?? [])] : [],
        secret: secret ?? null,
      },
    };
  }

  if (tool.name === 'screen' || tool.name === 'finish') {
    const read = tool.input.safeParse(props.args ?? {});

    if (!read.success)
      return {
        kind: 'refused',
        error: read.error.issues[0]?.message ?? 'Call it again.',
      };

    return 'name' in read.data
      ? { kind: 'screen', screen: read.data }
      : { kind: 'finish', finish: read.data };
  }

  const read = tool.input.safeParse(props.args ?? {});

  if (!read.success)
    return { kind: 'refused', error: read.error.issues[0]?.message ?? 'Call it again.' };

  if (tool.name === 'look') return { kind: 'look' };

  if (tool.name === 'network') {
    const { id, filter } = read.data as { id?: number; filter?: string };

    return {
      kind: 'network',
      ask: {
        ...(id === undefined ? {} : { id }),
        ...(filter === undefined || filter === '' ? {} : { filter }),
      },
    };
  }

  if (tool.name === 'inspect')
    return { kind: 'inspect', target: (read.data as { target: string }).target };

  const args = read.data as {
    target?: string;
    value?: string;
    direction?: string;
    until?: string;
    to?: string;
    file?: string;
    dialog?: DialogAnswer;
    promptText?: string;
  };

  return {
    kind: 'act',
    action: {
      kind: tool.name,
      target: tool.name === 'scroll' ? (args.until ?? '') : (args.target ?? ''),
      value: args.direction ?? args.to ?? args.file ?? args.value ?? '',
      ...(args.dialog === undefined ? {} : { dialog: args.dialog }),
      ...(args.promptText === undefined ? {} : { promptText: args.promptText }),
    },
  };
}

function cleaned<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? withoutStrayTags(value) : value,
    ]),
  ) as T;
}
