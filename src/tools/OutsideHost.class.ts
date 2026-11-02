import type { OutsideListen, OutsidePerform } from '@/tools/servers/outside/types';
import type { IncomingMessage, Server as HttpServer, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { MCP_HOST } from '@/tools/constants';
import { isLocalRequest, workspaceOfPath } from '@/tools/library';
import {
  callOutsideTool,
  OUTSIDE_SERVER,
  outsideAddressOf,
  registerOutsideTools,
} from '@/tools/servers/outside';

/**
 * A porta do QAzinho para os agentes de fora: um endereço estável no loopback, com um
 * token no caminho, e só as ferramentas que eles recebem.
 */
export class OutsideHost {
  private server: HttpServer | null = null;
  private token = '';
  private port = 0;
  private perform: OutsidePerform | null = null;

  /** Abre a porta pedida, ou uma livre com a porta 0; uma ocupada não derruba o app. */
  public async start(props: {
    port: number;
    token: string;
    perform: OutsidePerform;
  }): Promise<OutsideListen> {
    await this.stop();

    const server = createServer((request, response) => {
      void this.serve({ request, response });
    });
    const isListening = await new Promise<boolean>((done) => {
      server.once('error', () => {
        done(false);
      });
      server.listen(props.port, MCP_HOST.host, () => {
        done(true);
      });
    });

    if (!isListening) return { isListening: false };

    this.server = server;
    this.token = props.token;
    this.perform = props.perform;
    this.port = (server.address() as AddressInfo).port;

    return { isListening: true, port: this.port };
  }

  /** O endereço que um agente de fora guarda; null com a porta fechada. */
  public address(): string | null {
    if (!this.server) return null;

    return outsideAddressOf({ port: this.port, token: this.token });
  }

  public async stop(): Promise<void> {
    const { server } = this;

    this.server = null;
    this.perform = null;

    if (!server) return;

    await new Promise<void>((closed) => {
      server.close(() => {
        closed();
      });
      server.closeAllConnections();
    });
  }

  private async serve(props: {
    request: IncomingMessage;
    response: ServerResponse;
  }): Promise<void> {
    const { request, response } = props;
    const { perform } = this;
    const scope = workspaceOfPath({ path: request.url ?? '', token: this.token });
    const isAllowed =
      perform !== null &&
      scope === OUTSIDE_SERVER.path &&
      isLocalRequest({
        host: request.headers.host,
        origin: request.headers.origin,
        port: this.port,
      });

    if (!isAllowed) {
      response.writeHead(404).end();

      return;
    }

    const mcp = new McpServer(
      { name: MCP_HOST.name, version: MCP_HOST.version },
      { instructions: OUTSIDE_SERVER.instructions },
    );

    registerOutsideTools({ mcp, call: (call) => callOutsideTool({ perform, call }) });

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    response.on('close', () => {
      void transport.close();
      void mcp.close();
    });

    await mcp.connect(transport);
    await transport.handleRequest(request, response);
  }
}
