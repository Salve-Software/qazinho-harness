import type { DevicePurpose } from '@/tools/servers/device/types';
import type Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOf } from '@/library';
import { DEVICE_TOOLS, TOOLS_LEFT_OUT } from '@/tools/servers/device/constants';

/**
 * As ferramentas de dispositivo que um propósito recebe, como a Messages API lê uma
 * ferramenta: o nome, o que faz e o JSON Schema dos argumentos.
 */
export function deviceToolsOf(purpose: DevicePurpose): Anthropic.Tool[] {
  return DEVICE_TOOLS.filter(({ name }) => !TOOLS_LEFT_OUT[purpose].includes(name)).map(
    (tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: jsonSchemaOf(tool.input) as Anthropic.Tool.InputSchema,
    }),
  );
}
