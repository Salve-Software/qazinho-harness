import type { IAgentServer } from '@/tools/types';

/**
 * An `--mcp-config` with the QA's own servers listed beside what it already holds; null
 * when it holds nothing.
 */
export function mcpConfigWith(props: {
  config: string | null;
  servers: IAgentServer[];
}): string | null {
  if (props.servers.length === 0) return props.config;

  const kept = (
    props.config === null ? {} : (JSON.parse(props.config) as { mcpServers?: object })
  ).mcpServers;

  return JSON.stringify({
    mcpServers: {
      ...kept,
      ...Object.fromEntries(
        props.servers.map(({ name, url }) => [name, { type: 'http', url }]),
      ),
    },
  });
}
