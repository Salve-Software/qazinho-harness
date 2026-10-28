import type { IAttachApp } from '@/tools/servers/app/types';
import type { IAttachDevice } from '@/tools/servers/device/types';
import type { IAttachSources } from '@/tools/servers/sources/types';
import type { IAttachSuite } from '@/tools/servers/suite/types';
import type { IncomingMessage, Server as HttpServer, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { MCP_HOST } from '@/tools/constants';
import { callAppTool, registerAppTools } from '@/tools/servers/app';
import { callDeviceTool, registerDeviceTools } from '@/tools/servers/device';
import { callSourceTool, registerSourceTools } from '@/tools/servers/sources';
import { callSuiteTool, registerSuiteTools } from '@/tools/servers/suite';
import { registerPermissionTool, workspaceOfPath } from './library';

/**
 * Serve as ferramentas MCP do QAzinho no loopback, um escopo por run, assistente, mudança
 * de suíte ou turno de chat.
 */
export class McpHost {
  private readonly token = randomUUID();
  private readonly devices = new Map<string, IAttachDevice>();
  private readonly apps = new Map<string, IAttachApp>();
  private readonly suites = new Map<string, IAttachSuite>();
  private readonly sources = new Map<string, IAttachSources>();
  private readonly queues = new Map<string, Promise<unknown>>();
  private server: HttpServer | null = null;
  private port = 0;

  public async start(): Promise<void> {
    if (this.server) return;

    const server = createServer((request, response) => {
      void this.serve({ request, response });
    });

    await new Promise<void>((listening) => {
      server.listen(0, MCP_HOST.host, listening);
    });

    this.server = server;
    this.port = (server.address() as AddressInfo).port;
  }

  public attach(device: IAttachDevice): void {
    this.devices.set(device.workspaceId, device);
  }

  public detach(workspaceId: string): void {
    this.devices.delete(workspaceId);
    this.queues.delete(workspaceId);
  }

  /**
   * Serve as ferramentas do app no escopo do app, cada chamada executada por ele, até o
   * `detachApp`.
   */
  public attachApp(app: IAttachApp): void {
    this.apps.set(app.scope, app);
  }

  public detachApp(scope: string): void {
    this.apps.delete(scope);
    this.queues.delete(scope);
  }

  /**
   * Serve as ferramentas da suíte no escopo de um agente que muda uma suíte, cada
   * execução feita por ele, até o `detachSuite`.
   */
  public attachSuite(suite: IAttachSuite): void {
    this.suites.set(suite.scope, suite);
  }

  public detachSuite(scope: string): void {
    this.suites.delete(scope);
    this.queues.delete(scope);
  }

  /**
   * Serve as ferramentas de fonte no escopo de um chat que responde, cada busca feita por
   * ele, até o `detachSources`.
   */
  public attachSources(sources: IAttachSources): void {
    this.sources.set(sources.scope, sources);
  }

  public detachSources(scope: string): void {
    this.sources.delete(scope);
    this.queues.delete(scope);
  }

  /**
   * O `--mcp-config` de que um agente precisa para alcançar as ferramentas anexadas num
   * escopo, e quanto tempo uma chamada pode levar; null antes do start.
   */
  public mcpConfigFor(scope: string, toolTimeoutMs?: number): string | null {
    if (!this.server) return null;

    const url = `http://${MCP_HOST.host}:${String(this.port)}/${this.token}/${encodeURIComponent(scope)}`;

    return JSON.stringify({
      mcpServers: {
        [MCP_HOST.name]: {
          type: 'http',
          url,
          ...(toolTimeoutMs === undefined ? {} : { timeout: toolTimeoutMs }),
        },
      },
    });
  }

  public close(): void {
    this.devices.clear();
    this.apps.clear();
    this.suites.clear();
    this.sources.clear();
    this.queues.clear();
    this.server?.close();
    this.server = null;
  }

  private async serve(props: {
    request: IncomingMessage;
    response: ServerResponse;
  }): Promise<void> {
    const { request, response } = props;
    const scope = workspaceOfPath({ path: request.url ?? '', token: this.token });
    const device = scope === null ? undefined : this.devices.get(scope);
    const app = scope === null ? undefined : this.apps.get(scope);
    const suite = scope === null ? undefined : this.suites.get(scope);
    const sources = scope === null ? undefined : this.sources.get(scope);

    const isPermissions = scope === MCP_HOST.permissionsScope;

    if (scope === null || (!device && !app && !suite && !sources && !isPermissions)) {
      response.writeHead(404).end();

      return;
    }

    const mcp = new McpServer({ name: MCP_HOST.name, version: MCP_HOST.version });

    registerPermissionTool(mcp);

    if (device)
      registerDeviceTools({
        mcp,
        purpose: device.purpose ?? 'walk',
        call: (call) =>
          this.inTurn({ scope, call: () => callDeviceTool({ device, call }) }),
      });
    else if (app)
      registerAppTools({
        mcp,
        call: (call) => this.inTurn({ scope, call: () => callAppTool({ app, call }) }),
      });
    else if (suite)
      registerSuiteTools({
        mcp,
        call: (call) =>
          this.inTurn({ scope, call: () => callSuiteTool({ suite, call }) }),
      });
    else if (sources)
      registerSourceTools({
        mcp,
        call: (call) =>
          this.inTurn({ scope, call: () => callSourceTool({ sources, call }) }),
      });

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

  private inTurn<T>(props: { scope: string; call: () => Promise<T> }): Promise<T> {
    const before = this.queues.get(props.scope) ?? Promise.resolve();
    const turn = before.then(props.call, props.call);

    this.queues.set(
      props.scope,
      turn.catch(() => undefined),
    );

    return turn;
  }
}
