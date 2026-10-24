import type { AppToolCall } from '@/contract';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterEach, describe, expect, it } from 'vitest';
import { MCP_HOST, McpHost, PERMISSION_TOOL } from '@/tools';

/**
 * McpHost serves the tools on loopback, the way the desktop and the API hand them to an agent's
 * CLI: these tests read the address back from the config it writes, as the CLI does.
 */
const hosts: McpHost[] = [];

async function started(): Promise<McpHost> {
  const host = new McpHost();
  hosts.push(host);
  await host.start();
  return host;
}

function urlOf(config: string | null): string {
  const parsed = JSON.parse(config ?? 'null') as {
    mcpServers: Record<string, { url: string; timeout?: number }>;
  };
  const server = parsed.mcpServers[MCP_HOST.name];
  if (!server) throw new Error('the config names no QAzinho server');
  return server.url;
}

async function toolNamesAt(url: string): Promise<string[]> {
  const client = new Client({ name: 'test', version: '0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));
  const { tools } = await client.listTools();
  await client.close();
  return tools.map((tool) => tool.name);
}

const app = (calls: AppToolCall[]) => ({
  scope: '~assistant',
  perform: async (call: AppToolCall) => {
    calls.push(call);
    return { text: 'done', isError: false };
  },
});

afterEach(() => {
  for (const host of hosts.splice(0)) host.close();
});

describe('McpHost', () => {
  it('writes no config before it starts, since there is no address yet', () => {
    expect(new McpHost().mcpConfigFor('~assistant')).toBeNull();
  });

  it('tells the agent how long one call may take when the host says so', async () => {
    const host = await started();
    const config = JSON.parse(host.mcpConfigFor('~assistant', 300_000) ?? '{}') as {
      mcpServers: Record<string, { timeout?: number; type: string }>;
    };

    expect(config.mcpServers[MCP_HOST.name]).toMatchObject({
      type: 'http',
      timeout: 300_000,
    });
  });

  it('serves an attached app its tools and the permission tool under its scope', async () => {
    const host = await started();
    host.attachApp(app([]));

    const names = await toolNamesAt(urlOf(host.mcpConfigFor('~assistant')));

    expect(names).toContain('workspace_details');
    expect(names).toContain(PERMISSION_TOOL.name);
  });

  it('carries a call out through the host that attached the scope', async () => {
    const host = await started();
    const calls: AppToolCall[] = [];
    host.attachApp(app(calls));
    const client = new Client({ name: 'test', version: '0' });
    await client.connect(
      new StreamableHTTPClientTransport(new URL(urlOf(host.mcpConfigFor('~assistant')))),
    );

    const answer = await client.callTool({
      name: 'workspace_details',
      arguments: { workspace: 'Checkout' },
    });
    await client.close();

    expect(calls).toEqual([
      { name: 'workspace_details', args: { workspace: 'Checkout' } },
    ]);
    expect(answer.content).toEqual([{ type: 'text', text: 'done' }]);
  });

  it('serves the permissions scope alone, with nothing attached to it', async () => {
    const host = await started();

    const names = await toolNamesAt(urlOf(host.mcpConfigFor(MCP_HOST.permissionsScope)));

    expect(names).toEqual([PERMISSION_TOOL.name]);
  });

  it('refuses a scope nothing is attached to', async () => {
    const host = await started();

    const response = await fetch(urlOf(host.mcpConfigFor('~assistant')), {
      method: 'POST',
    });

    expect(response.status).toBe(404);
  });

  it('refuses an address without its token, even for an attached scope', async () => {
    const host = await started();
    host.attachApp(app([]));
    const url = new URL(urlOf(host.mcpConfigFor('~assistant')));

    const response = await fetch(`${url.origin}/not-the-token/~assistant`, {
      method: 'POST',
    });

    expect(response.status).toBe(404);
  });

  it('stops serving a scope once it is detached', async () => {
    const host = await started();
    host.attachApp(app([]));
    host.detachApp('~assistant');

    const response = await fetch(urlOf(host.mcpConfigFor('~assistant')), {
      method: 'POST',
    });

    expect(response.status).toBe(404);
  });
});
