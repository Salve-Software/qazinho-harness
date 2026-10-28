import type { IScreenElement } from '@/engine/devices/IosDriver/types';

type Described = {
  AXLabel?: unknown;
  AXValue?: unknown;
  type?: unknown;
  traits?: unknown;
  frame?: { x?: unknown; y?: unknown; width?: unknown; height?: unknown };
};

/**
 * O `idb ui describe-all` já respondeu tanto com um array JSON quanto com um objeto por
 * linha; aceite os dois.
 */
export function parseElements(described: string): IScreenElement[] {
  const trimmed = described.trim();
  const whole = readJson(trimmed);

  if (Array.isArray(whole)) return (whole as Described[]).flatMap(toElement);

  return trimmed
    .split('\n')
    .map(readJson)
    .filter((one) => one !== null)
    .flatMap((one) => toElement(one as Described));
}

function read(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
}

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toElement(one: Described): IScreenElement[] {
  const label =
    [one.AXLabel, one.AXValue].find((value) => typeof value === 'string') ?? '';
  const [x, y, width, height] = [
    read(one.frame?.x),
    read(one.frame?.y),
    read(one.frame?.width),
    read(one.frame?.height),
  ];

  if ([x, y, width, height].some(Number.isNaN) || width <= 0 || height <= 0) return [];

  return [
    {
      label: String(label),
      role: typeof one.type === 'string' ? one.type : '',
      x: Math.round(x + width / 2),
      y: Math.round(y + height / 2),
      box: { x, y, width, height },
      isLaunchIcon: Array.isArray(one.traits) && one.traits.includes('LaunchIcon'),
    },
  ];
}
