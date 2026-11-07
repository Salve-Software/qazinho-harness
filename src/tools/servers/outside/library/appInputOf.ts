import type { z } from 'zod';
import { APP_TOOLS } from '@/tools/servers/app/constants/APP_TOOLS';

/** O schema de uma ferramenta do assistente, para um agente de fora chamá-la igual. */
export function appInputOf(name: (typeof APP_TOOLS)[number]['name']): z.ZodObject {
  const tool = APP_TOOLS.find((one) => one.name === name);

  if (tool === undefined) throw new Error(`No app tool "${name}".`);

  return tool.input;
}
