import type { ToolAnswer } from '@/tools/types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { APP_TOOLS } from '@/tools/servers/app/constants';

/**
 * Põe cada ferramenta do app num servidor MCP, com o schema; uma chamada que passa por
 * ele vai para o `call`.
 */
export function registerAppTools(props: {
  mcp: McpServer;
  call: (call: { name: string; args: Record<string, unknown> }) => Promise<ToolAnswer>;
}): void {
  for (const tool of APP_TOOLS)
    props.mcp.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.input },
      (args: Record<string, unknown>) => props.call({ name: tool.name, args }),
    );
}
