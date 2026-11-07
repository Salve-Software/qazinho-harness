import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it } from 'vitest';
import { registerOutsideTools } from '@/tools/servers/outside/library';

describe('registerOutsideTools', () => {
  /** Uma lista curta: nada de permissão, de abrir tela nem de apagar. */
  it('offers only the seven tools of the loop, and passes a call along', async () => {
    const mcp = new McpServer({ name: 'qazinho', version: '0' });
    const client = new Client({ name: 'test', version: '0' });
    const [ours, theirs] = InMemoryTransport.createLinkedPair();
    const calls: { name: string; args: Record<string, unknown> }[] = [];

    registerOutsideTools({
      mcp,
      call: (call) => {
        calls.push(call);

        return Promise.resolve({
          content: [{ type: 'text', text: 'Done.' }],
          isError: false,
        });
      },
    });
    await mcp.connect(ours);
    await client.connect(theirs);

    const { tools } = await client.listTools();

    expect(tools.map(({ name }) => name)).toEqual([
      'list_workspaces',
      'workspace_details',
      'create_project',
      'create_workspace',
      'start_run',
      'run_status',
      'stop_run',
      'bug_details',
      'suggest_cases',
    ]);

    await client.callTool({ name: 'stop_run', arguments: { workspace: 'Compra' } });

    expect(calls).toEqual([{ name: 'stop_run', args: { workspace: 'Compra' } }]);
    await client.close();
  });
});
