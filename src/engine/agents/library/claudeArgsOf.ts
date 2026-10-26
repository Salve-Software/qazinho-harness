import { CLAUDE_CODE_AGENT } from '@/engine/agents/constants';

/** The flags that make Claude Code walk one case and answer in JSON lines: the run's system prompt beside its own, QAzinho's tools alone and none of its built-in ones, none of the developer's hooks, and the model the job asks for. */
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
