import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PERMISSION_TOOL } from '@/tools/constants';
import { permissionOf } from './permissionOf';

/** Puts on an MCP server the tool Claude Code asks for each permission its agent needs, answered at once by `permissionOf`. */
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
