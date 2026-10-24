import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, describe, expect, it } from 'vitest';
import { registerSourceTools } from '@/tools/servers/sources/library';

const open: Client[] = [];

/** The source tools on an MCP server, reached by a client over an in-memory pipe: no network. */
async function serve() {
  const calls: { name: string; args: Record<string, unknown> }[] = [];
  const mcp = new McpServer({ name: 'qazinho', version: '0' });
  const client = new Client({ name: 'test', version: '0' });
  const [ours, theirs] = InMemoryTransport.createLinkedPair();

  registerSourceTools({
    mcp,
    call: (call) => {
      calls.push(call);

      return Promise.resolve({
        content: [{ type: 'text', text: 'read' }],
        isError: false,
      });
    },
  });
  await mcp.connect(ours);
  await client.connect(theirs);
  open.push(client);

  return { client, calls };
}

afterEach(async () => {
  await Promise.all(open.splice(0).map((client) => client.close()));
});

describe('registerSourceTools', () => {
  it('hands each source tool call on', async () => {
    const { client, calls } = await serve();

    await client.callTool({ name: 'read_jira_story', arguments: { story: 'HC-878' } });

    expect(calls).toEqual([{ name: 'read_jira_story', args: { story: 'HC-878' } }]);
  });
});
