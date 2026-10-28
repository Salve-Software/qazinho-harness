import type { ICaseTurn } from '@/engine/walk/types';
import type { IDevicePort } from '@/tools/servers/device/types';
import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ClaudeCodeAgent } from '@/engine/agents';
import { McpHost } from '@/tools/McpHost.class';

/**
 * Um `claude` falso: guarda os argumentos com que foi iniciado e o que leu no stdin,
 * depois diz que um turno custou dois centavos, dorme quando o prompt pede, ou falha
 * quando mandam.
 */
const FAKE = `#!/usr/bin/env node
const { writeFileSync } = require('node:fs');
let prompt = '';
process.stdin.on('data', (chunk) => { prompt += chunk; });
process.stdin.on('end', () => {
  writeFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify({ args: process.argv.slice(2), prompt }));
  if (prompt.includes('sleep')) { setTimeout(() => {}, 60000); return; }
  if (prompt.includes('crash')) { process.stderr.write('no session'); process.exit(3); }
  process.stdout.write(JSON.stringify({ type: 'system', subtype: 'init' }) + '\\n');
  process.stdout.write(JSON.stringify({ type: 'result', total_cost_usd: 0.02, is_error: prompt.includes('refuse'), result: 'Not logged in' }) + '\\n');
});
`;

const port: IDevicePort = {
  describe: () => Promise.resolve(''),
  inspect: () => Promise.resolve(''),
  failedCalls: () => Promise.resolve([]),
  calls: () => Promise.resolve(''),
  glance: () => Promise.resolve(null),
  act: () => Promise.resolve(),
  motion: () => Promise.resolve(null),
};

const turnOf = (prompt: string): ICaseTurn => ({
  scope: 'plan-1',
  systemPrompt: 'You walk a case.',
  prompt,
  allowedTools: ['mcp__qazinho__look'],
  device: { workspaceId: 'plan-1', driver: port },
});

describe.skipIf(process.platform === 'win32')('ClaudeCodeAgent', () => {
  let folder = '';
  let command = '';
  const tools = new McpHost();

  beforeAll(async () => {
    folder = await mkdtemp(join(tmpdir(), 'qazinho-claude-'));
    command = join(folder, 'claude');
    await writeFile(command, FAKE);
    await chmod(command, 0o755);
    process.env.FAKE_CLAUDE_LOG = join(folder, 'log.json');
  });

  afterAll(() => {
    tools.close();
  });

  const agent = () =>
    new ClaudeCodeAgent({
      command,
      model: 'claude-haiku-5-5',
      tools,
      folder: join(folder, 'work'),
    });

  it('hands Claude Code the case with QAzinho’s tools, and says what the turn cost', async () => {
    const ended = await agent().walk(turnOf('Step 1: open the cart.'));
    const log = JSON.parse(await readFile(join(folder, 'log.json'), 'utf8')) as {
      args: string[];
      prompt: string;
    };

    expect(ended).toEqual({ kind: 'ended', costUsd: 0.02 });
    expect(log.prompt).toBe('Step 1: open the cart.');
    expect(log.args).toContain('--strict-mcp-config');
    expect(log.args[log.args.indexOf('--mcp-config') + 1]).toMatch(
      /"url":"http:\/\/127\.0\.0\.1:\d+\/[^"]+\/plan-1"/,
    );
  });

  it('breaks off with Claude Code’s words when its turn ends in an error', async () => {
    expect(await agent().walk(turnOf('refuse'))).toEqual({
      kind: 'failed',
      reason: 'Claude Code: Not logged in',
      costUsd: 0.02,
    });
  });

  it('breaks off with what it printed when it ends without answering', async () => {
    const ended = await agent().walk(turnOf('crash'));

    expect(ended).toMatchObject({ kind: 'failed', costUsd: null });
    expect(ended.kind === 'failed' ? ended.reason : '').toContain('no session');
  });

  it('ends a turn quietly once it is cancelled', async () => {
    const walker = agent();
    const walking = walker.walk(turnOf('sleep'));

    await new Promise((wake) => setTimeout(wake, 500));
    walker.cancel('plan-1');

    expect(await walking).toEqual({ kind: 'ended', costUsd: null });
  });
});
