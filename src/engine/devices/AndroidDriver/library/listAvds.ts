import { join } from 'node:path';
import { parseAvds } from './parseAvds';
import { runAdb } from './runAdb';

/**
 * Os emuladores que o QA já criou. O QAzinho nunca cria um, do mesmo jeito que nunca
 * baixa um SDK.
 */
export async function listAvds(sdkRoot: string): Promise<string[]> {
  const listed = await runAdb({
    adb: join(sdkRoot, 'emulator', 'emulator'),
    args: ['-list-avds'],
  }).catch(() => '');

  return parseAvds(listed);
}
