import type { McpHost } from '@/tools/McpHost.class';

/**
 * Onde está o Claude Code do desenvolvedor, o modelo que o job pede, o host que serve as
 * ferramentas do QAzinho a ele, e a pasta em que roda.
 */
export interface IClaudeCodeAgent {
  command: string;
  model: string | null;
  tools: McpHost;
  folder: string;
}
