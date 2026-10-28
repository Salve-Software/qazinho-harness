import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { IOS } from '@/engine/devices/IosDriver/constants';

const run = promisify(execFile);

/**
 * Toda palavra que o QAzinho diz a um simulador passa por aqui, idb e simctl igualmente.
 */
export async function runTool(props: {
  command: string;
  args: string[];
}): Promise<string> {
  const { stdout } = await run(props.command, props.args, {
    timeout: IOS.commandTimeoutMs,
    maxBuffer: IOS.maxBufferBytes,
    encoding: 'buffer',
  });

  return stdout.toString('utf8');
}
