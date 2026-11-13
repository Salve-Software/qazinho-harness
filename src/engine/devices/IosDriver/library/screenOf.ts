type Described = { type?: unknown; frame?: { width?: unknown; height?: unknown } };

/**
 * O tamanho da tela do simulador, nos pontos em que o AXe toca, lido da raiz do
 * `axe describe-ui`; null quando ele não lista app nenhum.
 */
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

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
