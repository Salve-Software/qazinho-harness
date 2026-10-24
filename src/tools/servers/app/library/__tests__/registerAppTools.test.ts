import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, describe, expect, it } from 'vitest';
import { registerAppTools } from '@/tools/servers/app/library';

/** The app tools on an MCP server, reached by a client over an in-memory pipe: no network. */
async function serve() {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  const mcp = new McpServer({ name: 'qazinho', version: '0' });
  const client = new Client({ name: 'test', version: '0' });
  const [ours, theirs] = InMemoryTransport.createLinkedPair();

  registerAppTools({
    mcp,
    call: async (call) => {
      calls.push(call);
      return { content: [{ type: 'text', text: 'Done.' }], isError: false };
    },
  });
  await mcp.connect(ours);
  await client.connect(theirs);
  open.push(client);

  return { client, calls };
}

const open: Client[] = [];

afterEach(async () => {
  for (const client of open.splice(0)) await client.close();
});

const textOf = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as { text: string }[])[0]?.text ?? '';

describe('registerAppTools', () => {
  it('hands a call that fits its schema on, with the arguments trimmed', async () => {
    const { client, calls } = await serve();
    const result = await client.callTool({
      name: 'open_workspace',
      arguments: { workspace: ' Checkout ', tab: 'runs' },
    });

    expect(result.isError).toBeFalsy();
    expect(calls).toEqual([
      { name: 'open_workspace', args: { workspace: 'Checkout', tab: 'runs' } },
    ]);
  });

  it('does NOT hand on a call that breaks the schema, and the agent reads why', async () => {
    const { client, calls } = await serve();
    const result = await client.callTool({
      name: 'change_settings',
      arguments: { theme: 'neon' },
    });

    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain('"theme" is night or paper.');
    expect(calls).toEqual([]);
  });

  it('lists every app tool, and none of the device', async () => {
    const { client } = await serve();
    const { tools } = await client.listTools();
    const names = tools.map(({ name }) => name);

    expect(names).toContain('delete_project');
    expect(names).not.toContain('click');
  });
});
