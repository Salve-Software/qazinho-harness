import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeChromePrefs } from '@/engine/devices/WebDriver/library';

/**
 * Depois de um login com uma senha conhecida de vazamentos, o Chrome abre um aviso modal.
 * Sem janela ele nunca fecha, e o mouse deixa de chegar à página enquanto digitar segue
 * funcionando: todo clique responde que deu certo e nada acontece.
 */
describe('a profile Chrome starts from', () => {
  let root = '';

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'qazinho-prefs-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('turns off the leaked password warning, in a profile that does not exist yet', async () => {
    const profileDir = join(root, 'missing', 'profile');

    await writeChromePrefs(profileDir);

    const prefs = JSON.parse(
      await readFile(join(profileDir, 'Default', 'Preferences'), 'utf8'),
    ) as { profile: { password_manager_leak_detection: boolean } };

    expect(prefs.profile.password_manager_leak_detection).toBe(false);
  });
});
