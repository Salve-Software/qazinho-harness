import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CHROME_PROFILE_PREFS } from '@/engine/devices/WebDriver/constants';

/**
 * Deixa o Chrome sem o aviso de senha vazada: sem janela ninguém o fecha, e enquanto ele
 * fica aberto nenhum clique chega à página.
 */
export async function writeChromePrefs(profileDir: string): Promise<void> {
  const folder = join(profileDir, 'Default');

  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'Preferences'), JSON.stringify(CHROME_PROFILE_PREFS));
}
