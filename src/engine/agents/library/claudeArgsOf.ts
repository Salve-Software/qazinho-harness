import { CLAUDE_CODE_AGENT } from '@/engine/agents/constants';

/**
 * As flags que fazem o Claude Code andar um caso em linhas JSON, só com as ferramentas do
 * QAzinho e sem hooks.
 */
export function claudeArgsOf(props: {
  systemPrompt: string;
  mcpConfig: string;
  allowedTools: string[];
  model: string | null;
}): string[] {
  return [
    '--print',
    '--output-format',
    'stream-json',
    '--verbose',
    '--settings',
    CLAUDE_CODE_AGENT.settings,
    ...(props.model === null ? [] : ['--model', props.model]),
    '--append-system-prompt',
    props.systemPrompt,
    '--mcp-config',
    props.mcpConfig,
    '--strict-mcp-config',
    '--tools',
    '',
    '--allowedTools',
    ...props.allowedTools,
  ];
}
