import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PERMISSION_TOOL } from '@/tools/constants';
import { permissionOf } from './permissionOf';

/**
 * Põe num servidor MCP a ferramenta que o Claude Code chama para cada permissão de que o
 * agente precisa, respondida na hora pelo `permissionOf`.
 */
export function registerPermissionTool(mcp: McpServer): void {
  mcp.registerTool(
    PERMISSION_TOOL.name,
    { description: PERMISSION_TOOL.description, inputSchema: PERMISSION_TOOL.input },
    (args: { tool_name: string; input?: unknown }) => ({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            permissionOf({ toolName: args.tool_name, input: args.input }),
          ),
        },
      ],
    }),
  );
}
