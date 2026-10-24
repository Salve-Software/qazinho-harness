const MINUTE_MS = 60_000;

/** How much time an exploration has left, in the words the agent reads after each action. */
export function timeLeftOf(leftMs: number): string {
  const minutes = Math.round(leftMs / MINUTE_MS);

  return minutes < 1
    ? 'Less than a minute is left: call finish soon.'
    : `About ${String(minutes)} minute${minutes === 1 ? '' : 's'} left.`;
}
