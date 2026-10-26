type Described = { type?: unknown; frame?: { width?: unknown; height?: unknown } };

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** How big the simulator's screen is, in the points idb taps at, read off the app at the root of `idb ui describe-all`; null when it lists no app. */
export function screenOf(described: string): { width: number; height: number } | null {
  const trimmed = described.trim();
  const whole = readJson(trimmed);
  const elements = (
    Array.isArray(whole) ? whole : trimmed.split('\n').map(readJson).filter(Boolean)
  ) as Described[];
  const app = elements.find((one) => one.type === 'Application');
  const width = Number(app?.frame?.width);
  const height = Number(app?.frame?.height);

  return width > 0 && height > 0 ? { width, height } : null;
}
