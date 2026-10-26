import type { DevicePurpose } from '@/tools/servers/device/types';
import type Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOf } from '@/library';
import { DEVICE_TOOLS, TOOLS_LEFT_OUT } from '@/tools/servers/device/constants';

/** The device tools a purpose gets, as the Messages API reads a tool: its name, what it does, and the JSON Schema of its arguments. */
export function deviceToolsOf(purpose: DevicePurpose): Anthropic.Tool[] {
  return DEVICE_TOOLS.filter(({ name }) => !TOOLS_LEFT_OUT[purpose].includes(name)).map(
    (tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: jsonSchemaOf(tool.input) as Anthropic.Tool.InputSchema,
    }),
  );
}
