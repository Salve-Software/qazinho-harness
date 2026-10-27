/**
 * Answers Claude Code's permission asks: any MCP tool, the QA's own included, and nothing
 * else.
 */
export function permissionOf(props: {
  toolName: string;
  input: unknown;
}): { behavior: 'allow'; updatedInput: unknown } | { behavior: 'deny'; message: string } {
  return props.toolName.startsWith('mcp__')
    ? { behavior: 'allow', updatedInput: props.input }
    : {
        behavior: 'deny',
        message: `QAzinho does not let you use ${props.toolName} there: only the tools and folders you were handed, and MCP tools.`,
      };
}
