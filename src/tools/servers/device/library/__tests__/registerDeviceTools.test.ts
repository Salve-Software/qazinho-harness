import type { DevicePurpose } from '@/tools/servers/device/types';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, describe, expect, it } from 'vitest';
import { registerDeviceTools } from '@/tools/servers/device/library';

/**
 * As ferramentas do dispositivo num servidor MCP, alcançadas por um cliente sobre um
 * canal em memória: sem rede.
 */
async function serve(purpose: DevicePurpose = 'walk') {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  const mcp = new McpServer({ name: 'qazinho', version: '0' });
  const client = new Client({ name: 'test', version: '0' });
  const [ours, theirs] = InMemoryTransport.createLinkedPair();

  registerDeviceTools({
    mcp,
    purpose,
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

describe('registerDeviceTools', () => {
  it('hands a call that fits its schema on, with the arguments trimmed', async () => {
    const { client, calls } = await serve();
    const result = await client.callTool({
      name: 'click',
      arguments: { target: ' Apply ' },
    });

    expect(result.isError).toBeFalsy();
    expect(calls).toEqual([{ name: 'click', args: { target: 'Apply' } }]);
  });

  it('does NOT hand on a call that breaks the schema, and the agent reads why', async () => {
    const { client, calls } = await serve();
    const result = await client.callTool({ name: 'click', arguments: {} });

    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain(
      '"click" needs a target: say what the control or URL is.',
    );
    expect(calls).toEqual([]);
  });

  it('answers a tool it does not have as an error, not a crash', async () => {
    const { client } = await serve();
    const result = await client.callTool({ name: 'pinch', arguments: {} });

    expect(result.isError).toBe(true);
  });
  it('gives a walk the report, and nothing to note screens or finish with', async () => {
    const { client } = await serve('walk');
    const names = (await client.listTools()).tools.map(({ name }) => name);

    expect(names).toContain('report');
    expect(names).toContain('bug');
    expect(names).not.toContain('screen');
    expect(names).not.toContain('finish');
  });

  it('gives an exploration its screens and its finish, and no report to file a step with', async () => {
    const { client } = await serve('explore');
    const names = (await client.listTools()).tools.map(({ name }) => name);

    expect(names).toEqual(
      expect.arrayContaining(['look', 'click', 'bug', 'screen', 'finish']),
    );
    expect(names).not.toContain('report');
  });
});
