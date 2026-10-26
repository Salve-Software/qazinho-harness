import { join } from 'node:path';
import { parseAvds } from './parseAvds';
import { runAdb } from './runAdb';

/** The emulators the QA already made. QAzinho never creates one, the way it never downloads an SDK. */
export async function listAvds(sdkRoot: string): Promise<string[]> {
  const listed = await runAdb({
    adb: join(sdkRoot, 'emulator', 'emulator'),
    args: ['-list-avds'],
  }).catch(() => '');

  return parseAvds(listed);
}
