/**
 * O pid do app em primeiro plano, lido da raiz do `axe describe-ui`; null quando a tela
 * vem vazia ou a saída não é JSON.
 */
export function rootPidOf(described: string): number | null {
  const root = readJson(described.trim());
  const list: unknown[] = Array.isArray(root) ? (root as unknown[]) : [root];
  const node = list[0];
  const pid =
    node !== null && typeof node === 'object' && 'pid' in node ? node.pid : null;

  return typeof pid === 'number' && Number.isFinite(pid) ? pid : null;
}

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
