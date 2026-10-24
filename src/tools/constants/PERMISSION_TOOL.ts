import { z } from 'zod';
import { MCP_HOST } from './MCP_HOST';

export const PERMISSION_TOOL = {
  granted: `mcp__${MCP_HOST.name}__approve_permission`,
  name: 'approve_permission',
  description:
    'QAzinho answers with it each permission Claude Code would ask the QA for. Never call it yourself: it decides nothing you ask.',
  input: z.object({
    tool_name: z.string(),
    input: z.unknown(),
    tool_use_id: z.string().optional(),
  }),
} as const;
