import { runAdbRaw } from './runAdbRaw';

/** Every word QAzinho says to a device goes through here, so one place knows where adb is. */
export async function runAdb(props: { adb: string; args: string[] }): Promise<string> {
  return (await runAdbRaw(props)).toString('utf8');
}
