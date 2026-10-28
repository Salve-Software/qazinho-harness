/**
 * O nome num controle como o `look` o lista, "button: Buy" lido como "Buy"; nada quando
 * não tem essa forma.
 */
export function withoutRole(target: string): string | null {
  const listed = /^[a-z][a-z-]*:\s+(\S.*)$/.exec(target.trim());

  return listed?.[1] ?? null;
}
