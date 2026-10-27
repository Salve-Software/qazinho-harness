import type { McpHost } from '@/tools/McpHost.class';

/**
 * Where the developer's Claude Code is, the model the job asks for, the host that serves
 * QAzinho's tools to it, and the folder it runs in.
 */
export interface IClaudeCodeAgent {
  command: string;
  model: string | null;
  tools: McpHost;
  folder: string;
}
