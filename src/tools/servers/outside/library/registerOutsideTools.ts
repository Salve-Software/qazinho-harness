import type { ToolAnswer } from '@/tools/types';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OUTSIDE_TOOLS } from '@/tools/servers/outside/constants';

/**
 * Põe num servidor MCP as ferramentas que um agente de fora recebe, com o schema; uma
 * chamada que passa por ele vai para o `call`.
 */
export function registerOutsideTools(props: {
  mcp: McpServer;
  call: (call: { name: string; args: Record<string, unknown> }) => Promise<ToolAnswer>;
}): void {
  for (const tool of OUTSIDE_TOOLS)
    props.mcp.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.input },
      (args: Record<string, unknown>) => props.call({ name: tool.name, args }),
    );
}
