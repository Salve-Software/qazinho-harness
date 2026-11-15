/** A pasta de um AVD pelo .ini com o nome dele, que guarda o caminho em `path=`. */
export function avdFolderOf(ini: string): string | null {
  const path = /^path=(.+)$/m.exec(ini)?.[1]?.trim();

  return path === undefined || path === '' ? null : path;
}
