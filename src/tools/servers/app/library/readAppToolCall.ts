import type { AppToolRead } from '@/tools/servers/app/types';
import type { z } from 'zod';
import { APP_TOOLS } from '@/tools/servers/app/constants';

type AppTool = (typeof APP_TOOLS)[number];

type Read = AppTool extends infer Tool
  ? Tool extends AppTool
    ? { name: Tool['name']; args: z.output<Tool['input']> }
    : never
  : never;

/**
 * Reads an app tool call against the tool's own schema; a call that breaks it is refused
 * with the reason.
 */
export function readAppToolCall(props: {
  name: string;
  args: Record<string, unknown> | undefined;
}): AppToolRead {
  const tool = APP_TOOLS.find(({ name }) => name === props.name);

  if (!tool)
    return { kind: 'refused', error: `There is no tool called "${props.name}".` };

  const read = tool.input.safeParse(props.args ?? {});

  if (!read.success)
    return { kind: 'refused', error: read.error.issues[0]?.message ?? 'Call it again.' };

  if (
    tool.name === 'change_settings' &&
    Object.values(read.data).every((value) => value === undefined)
  )
    return {
      kind: 'refused',
      error: '"change_settings" needs at least one of theme, language or runAlert.',
    };

  const call = { name: tool.name, args: read.data } as Read;

  return { kind: 'call', call };
}
