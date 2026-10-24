import { describe, expect, it } from 'vitest';
import { toolsOfRole } from '@/tools/library';

const GRANTS = [{ group: 'device' as const, roles: ['runner' as const] }];

describe('toolsOfRole', () => {
  it('lets a granted role call QAzinho own MCP server', () => {
    expect(toolsOfRole({ grants: GRANTS, role: 'runner', server: 'qazinho' })).toEqual({
      groups: ['device'],
      allowedTools: ['mcp__qazinho'],
    });
  });

  it('gives a role no grant names no tool at all', () => {
    expect(toolsOfRole({ grants: GRANTS, role: 'chat', server: 'qazinho' })).toEqual({
      groups: [],
      allowedTools: [],
    });
  });
});
