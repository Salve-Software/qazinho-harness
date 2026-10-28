import { describe, expect, it } from 'vitest';
import { permissionOf } from '@/tools/library';

describe('permissionOf', () => {
  /**
   * O MCP da empresa do QA é responsabilidade do próprio QA: o chat o usa sem perguntar.
   */
  it("lets the chat use any tool of an MCP server, the QA's own included, as it was called", () => {
    expect(
      permissionOf({
        toolName: 'mcp__atlassian__getConfluencePage',
        input: { pageId: '42' },
      }),
    ).toEqual({ behavior: 'allow', updatedInput: { pageId: '42' } });
  });

  it('does NOT let it read a file outside the folders it was handed, nor anything else', () => {
    expect(
      permissionOf({ toolName: 'Read', input: { file_path: '/etc/hosts' } }),
    ).toMatchObject({
      behavior: 'deny',
    });
    expect(permissionOf({ toolName: 'Bash', input: { command: 'ls' } })).toMatchObject({
      behavior: 'deny',
    });
  });
});
