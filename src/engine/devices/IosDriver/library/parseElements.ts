import type { IScreenElement } from '@/engine/devices/IosDriver/types';

type Node = {
  AXLabel?: unknown;
  AXValue?: unknown;
  type?: unknown;
  frame?: { x?: unknown; y?: unknown; width?: unknown; height?: unknown };
  children?: unknown;
};

/**
 * O `axe describe-ui` devolve uma árvore: a raiz é o app e cada nó traz os filhos dele.
 * Achata tudo num nível só, um controle por nó com rótulo e caixa.
 */
export function parseElements(described: string): IScreenElement[] {
  const nodes: Node[] = [];

  collect(readJson(described.trim()), nodes);

  return nodes.flatMap(toElement);
}

function collect(value: unknown, out: Node[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, out);

    return;
  }

  if (value !== null && typeof value === 'object') {
    const node = value as Node;

    out.push(node);
    collect(node.children, out);
  }
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

function toElement(one: Node): IScreenElement[] {
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
    },
  ];
}
