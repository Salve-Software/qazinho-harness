import { describe, expect, it } from 'vitest';
import { outsideCallerOf } from '@/tools/servers/outside/library';

describe('outsideCallerOf', () => {
  /** Os User-Agents como o Claude Code 2.1 e o Codex 0.163 os mandaram a um servidor MCP. */
  it('knows Claude Code and Codex by the name each sends', () => {
    expect(outsideCallerOf('claude-code/2.1.325 (sdk-ts, agent-sdk/0.3.325)')).toBe(
      'claude-code',
    );
    expect(outsideCallerOf('codex-mcp-client/0.163.0')).toBe('codex');
  });

  it('calls any other agent, or none named, another', () => {
    expect(outsideCallerOf('cursor/1.0')).toBe('other');
    expect(outsideCallerOf(undefined)).toBe('other');
    expect(outsideCallerOf('')).toBe('other');
  });
});
