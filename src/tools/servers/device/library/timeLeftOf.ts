const MINUTE_MS = 60_000;

/**
 * Quanto tempo resta a uma exploração, nas palavras que o agente lê depois de cada ação.
 */
export function timeLeftOf(leftMs: number): string {
  const minutes = Math.round(leftMs / MINUTE_MS);

  return minutes < 1
    ? 'Less than a minute is left: call finish soon.'
    : `About ${String(minutes)} minute${minutes === 1 ? '' : 's'} left.`;
}
