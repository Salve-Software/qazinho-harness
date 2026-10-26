/** `dumpsys window` names the window with focus, which is the app the QA is looking at. */
export function frontPackage(dumped: string): string {
  const found = /mCurrentFocus=Window\{[^}]*\s+([\w.]+)\/[\w.]+\}/.exec(dumped);

  return found?.[1] ?? '';
}
