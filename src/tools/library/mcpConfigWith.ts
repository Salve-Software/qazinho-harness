import type { IAgentServer } from '@/tools/types';

/**
 * Um `--mcp-config` com os servidores do próprio QA listados ao lado do que ele já tem;
 * null quando ele não tem nada.
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
