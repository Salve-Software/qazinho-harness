import { MCP_HOST } from '@/tools/constants';
import { OUTSIDE_SERVER } from '@/tools/servers/outside/constants';

/** O endereço que um agente de fora guarda, de uma porta e de um token. */
export function outsideAddressOf(props: { port: number; token: string }): string {
  return `http://${MCP_HOST.host}:${String(props.port)}/${props.token}/${OUTSIDE_SERVER.path}`;
}
