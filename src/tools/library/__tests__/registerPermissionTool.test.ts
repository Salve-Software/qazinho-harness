import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it } from 'vitest';
import { registerPermissionTool } from '@/tools/library';

describe('registerPermissionTool', () => {
  /** Called the way Claude Code calls it, over an in-memory pipe: no network. */
  it('answers a permission at once, in the shape Claude Code reads', async () => {
    const mcp = new McpServer({ name: 'qazinho', version: '0' });
    const client = new Client({ name: 'test', version: '0' });
    const [ours, theirs] = InMemoryTransport.createLinkedPair();

    registerPermissionTool(mcp);
    await mcp.connect(ours);
    await client.connect(theirs);

    const answer = await client.callTool({
      name: 'approve_permission',
      arguments: {
        tool_name: 'mcp__acme__lookup',
        input: { q: 'billing' },
        tool_use_id: 't1',
      },
    });

    expect(answer.content).toEqual([
      {
        type: 'text',
        text: JSON.stringify({ behavior: 'allow', updatedInput: { q: 'billing' } }),
      },
    ]);
    await client.close();
  });
});
