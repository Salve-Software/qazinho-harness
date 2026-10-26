import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ANDROID } from '@/engine/devices/AndroidDriver/constants';

const run = promisify(execFile);

/** A screenshot is bytes, not text, so nothing decodes what adb hands back here. */
export async function runAdbRaw(props: { adb: string; args: string[] }): Promise<Buffer> {
  const { stdout } = await run(props.adb, props.args, {
    timeout: ANDROID.commandTimeoutMs,
    maxBuffer: ANDROID.maxBufferBytes,
    encoding: 'buffer',
    windowsHide: true,
  });

  return stdout;
}
