import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, describe, expect, it } from 'vitest';
import { registerSuiteTools } from '@/tools/servers/suite/library';

const open: Client[] = [];

/** The suite tools on an MCP server, reached by a client over an in-memory pipe: no network. */
async function serve() {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  const mcp = new McpServer({ name: 'qazinho', version: '0' });
  const client = new Client({ name: 'test', version: '0' });
  const [ours, theirs] = InMemoryTransport.createLinkedPair();

  registerSuiteTools({
    mcp,
    call: async (call) => {
      calls.push(call);

      return { content: [{ type: 'text', text: 'Ran.' }], isError: false };
    },
  });
  await mcp.connect(ours);
  await client.connect(theirs);
  open.push(client);

  return { client, calls };
}

afterEach(async () => {
  for (const client of open.splice(0)) await client.close();
});

describe('registerSuiteTools', () => {
  it('lists run_tests to the agent, and nothing that touches git or a shell', async () => {
    const { client } = await serve();

    expect((await client.listTools()).tools.map(({ name }) => name)).toEqual([
      'run_tests',
    ]);
  });

  it('hands a call that fits its schema on', async () => {
    const { client, calls } = await serve();

    await client.callTool({
      name: 'run_tests',
      arguments: { tests: ['tests/a.spec.ts:3'], project: 'chromium' },
    });

    expect(calls).toEqual([
      { name: 'run_tests', args: { tests: ['tests/a.spec.ts:3'], project: 'chromium' } },
    ]);
  });
});
