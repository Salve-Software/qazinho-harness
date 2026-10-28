/** O `dumpsys window` nomeia a janela com foco, que é o app que o QA está vendo. */
export function frontPackage(dumped: string): string {
  const found = /mCurrentFocus=Window\{[^}]*\s+([\w.]+)\/[\w.]+\}/.exec(dumped);

  return found?.[1] ?? '';
}
