import type { DevicePurpose } from '@/tools/servers/device/types';
import type { ToolAnswer } from '@/tools/types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DEVICE_TOOLS, TOOLS_LEFT_OUT } from '@/tools/servers/device/constants';

/**
 * Põe num servidor MCP as ferramentas de dispositivo de que um propósito precisa, com os
 * schemas; uma chamada que passa por um vai para o `call`.
 */
export function registerDeviceTools(props: {
  mcp: McpServer;
  purpose: DevicePurpose;
  call: (call: { name: string; args: Record<string, unknown> }) => Promise<ToolAnswer>;
}): void {
  for (const tool of DEVICE_TOOLS)
    if (!TOOLS_LEFT_OUT[props.purpose].includes(tool.name))
      props.mcp.registerTool(
        tool.name,
        { description: tool.description, inputSchema: tool.input },
        (args: Record<string, unknown>) => props.call({ name: tool.name, args }),
      );
}
