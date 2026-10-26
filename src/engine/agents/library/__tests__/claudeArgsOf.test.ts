import { describe, expect, it } from 'vitest';
import { claudeArgsOf } from '@/engine/agents';

describe('claudeArgsOf', () => {
  it('walks with QAzinho’s tools alone, none built in, no hooks, in JSON lines', () => {
    const args = claudeArgsOf({
      systemPrompt: 'You walk a case.',
      mcpConfig: '{"mcpServers":{}}',
      allowedTools: ['mcp__qazinho__look', 'mcp__qazinho__report'],
      model: 'claude-haiku-5-5',
    });

    expect(args).toEqual([
      '--print',
      '--output-format',
      'stream-json',
      '--verbose',
      '--settings',
      '{"disableAllHooks":true}',
      '--model',
      'claude-haiku-5-5',
      '--append-system-prompt',
      'You walk a case.',
      '--mcp-config',
      '{"mcpServers":{}}',
      '--strict-mcp-config',
      '--tools',
      '',
      '--allowedTools',
      'mcp__qazinho__look',
      'mcp__qazinho__report',
    ]);
  });

  it('leaves the model to Claude Code when the job names none', () => {
    expect(
      claudeArgsOf({ systemPrompt: '', mcpConfig: '{}', allowedTools: [], model: null }),
    ).not.toContain('--model');
  });
});
