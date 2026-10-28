import type { IClaudeCodeAgent } from './types';
import type { CaseTurnEnd, ICaseAgent, ICaseTurn } from '@/engine/walk/types';
import type { McpHost } from '@/tools/McpHost.class';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { killTree, spawnCommand } from '@/engine/library';
import { CLAUDE_CODE_AGENT } from './constants';
import { claudeArgsOf, turnResultOf } from './library';

/**
 * Anda um caso pelo Claude Code local com as ferramentas de dispositivo do QAzinho no
 * loopback, nunca pelo gateway.
 */
export class ClaudeCodeAgent implements ICaseAgent {
  private readonly command: string;
  private readonly model: string | null;
  private readonly tools: McpHost;
  private readonly folder: string;
  private readonly children = new Map<string, ChildProcessWithoutNullStreams>();
  private readonly cancelled = new Set<string>();

  public constructor(props: IClaudeCodeAgent) {
    this.command = props.command;
    this.model = props.model;
    this.tools = props.tools;
    this.folder = props.folder;
  }

  /**
   * Um turno de um caso: o Claude Code age pelas ferramentas do dispositivo até terminar
   * o turno, e diz quanto o turno custou.
   */
  public async walk(turn: ICaseTurn): Promise<CaseTurnEnd> {
    await this.tools.start();
    await mkdir(this.folder, { recursive: true });
    this.cancelled.delete(turn.scope);
    this.tools.attach(turn.device);

    const mcpConfig = this.tools.mcpConfigFor(turn.scope);

    if (mcpConfig === null)
      return { kind: 'failed', reason: 'The device tools are not up.', costUsd: null };

    try {
      return await this.ask({ turn, mcpConfig });
    } finally {
      this.tools.detach(turn.scope);
    }
  }

  /**
   * Termina o turno em andamento de um escopo, o Claude Code e tudo o que ele iniciou.
   */
  public cancel(scope: string): void {
    const child = this.children.get(scope);

    this.cancelled.add(scope);

    if (child !== undefined) killTree(child);
  }

  private async ask(props: { turn: ICaseTurn; mcpConfig: string }): Promise<CaseTurnEnd> {
    const { turn } = props;
    const child = spawnCommand({
      command: this.command,
      args: claudeArgsOf({
        systemPrompt: turn.systemPrompt,
        mcpConfig: props.mcpConfig,
        allowedTools: turn.allowedTools,
        model: this.model,
      }),
      options: {
        cwd: this.folder,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: process.platform !== 'win32',
      },
    });
    let result: ReturnType<typeof turnResultOf> = null;
    let stderr = '';

    this.children.set(turn.scope, child);
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = `${stderr}${chunk.toString()}`.slice(-CLAUDE_CODE_AGENT.stderrKeptChars);
    });
    createInterface({ input: child.stdout }).on('line', (line) => {
      result = turnResultOf(line) ?? result;
    });
    child.stdin.write(turn.prompt);
    child.stdin.end();

    const code = await new Promise<number | null>((settle) => {
      child.once('close', settle);
      child.once('error', () => {
        settle(null);
      });
    });

    if (this.children.get(turn.scope) === child) this.children.delete(turn.scope);

    const ended = result as ReturnType<typeof turnResultOf>;

    if (this.cancelled.has(turn.scope))
      return { kind: 'ended', costUsd: ended?.costUsd ?? null };

    if (ended === null)
      return {
        kind: 'failed',
        reason:
          `Claude Code ended (${String(code)}) without answering. ${stderr.trim()}`.trim(),
        costUsd: null,
      };

    return ended.isError
      ? { kind: 'failed', reason: `Claude Code: ${ended.text}`, costUsd: ended.costUsd }
      : { kind: 'ended', costUsd: ended.costUsd };
  }
}
