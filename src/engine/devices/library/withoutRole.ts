/** The name in a control as `look` lists it, "button: Buy" read as "Buy"; nothing when it is not that shape. */
export function withoutRole(target: string): string | null {
  const listed = /^[a-z][a-z-]*:\s+(\S.*)$/.exec(target.trim());

  return listed?.[1] ?? null;
}
