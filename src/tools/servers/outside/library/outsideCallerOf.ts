import type { OutsideCaller } from '@/contract';

/**
 * Que agente de código fez um pedido, pelo User-Agent que ele manda: o Claude Code diz
 * `claude-code/…`, o Codex `codex-mcp-client/…`.
 */
export function outsideCallerOf(userAgent: string | undefined): OutsideCaller {
  const said = (userAgent ?? '').trim().toLowerCase();

  if (said.startsWith('claude-code/')) return 'claude-code';
  if (said.startsWith('codex')) return 'codex';

  return 'other';
}
