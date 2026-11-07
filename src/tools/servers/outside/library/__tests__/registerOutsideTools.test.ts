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
      'update_project',
      'rename_workspace',
      'delete_workspace',
      'delete_project',
      'add_cases',
      'update_cases',
      'delete_cases',
      'explore_app',
      'start_run',
      'run_status',
      'stop_run',
      'bug_details',
      'dismiss_bug',
      'send_bug',
      'list_variables',
      'ask_variables',
      'update_variable',
      'delete_variable',
      'read_settings',
      'change_settings',
      'connect_integration',
      'disconnect_integration',
      'ask_workspace_chat',
      'read_workspace_chat',
      'suggest_cases',
    ]);

    await client.callTool({ name: 'stop_run', arguments: { workspace: 'Compra' } });

    expect(calls).toEqual([{ name: 'stop_run', args: { workspace: 'Compra' } }]);
    await client.close();
  });
});
