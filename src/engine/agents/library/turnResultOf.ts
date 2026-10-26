/** What Claude Code's closing line says of a turn: what it cost, and whether it ended in an error, with its words; null on any other line. */
export function turnResultOf(
  line: string,
): { costUsd: number | null; isError: boolean; text: string } | null {
  const trimmed = line.trim();

  if (!trimmed.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(trimmed) as {
      type?: unknown;
      total_cost_usd?: unknown;
      is_error?: unknown;
      result?: unknown;
    };

    if (parsed.type !== 'result') return null;

    const cost = parsed.total_cost_usd;

    return {
      costUsd:
        typeof cost === 'number' && Number.isFinite(cost) && cost >= 0 ? cost : null,
      isError: parsed.is_error === true,
      text: typeof parsed.result === 'string' ? parsed.result : '',
    };
  } catch {
    return null;
  }
}
