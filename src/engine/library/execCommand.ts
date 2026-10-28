import type { ExecFileOptions } from 'node:child_process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { envWithOnePath } from './envWithOnePath';
import { launchHere } from './launchHere';

const run = promisify(execFile);
const MAX_BUFFER_BYTES = 16 * 1024 * 1024;

/**
 * Roda um comando até o fim do jeito que esta plataforma pede, e responde com o que ele
 * imprimiu; rejeita como o execFile, com o que ele imprimiu no erro.
 */
export async function execCommand(props: {
  command: string;
  args: string[];
  options?: ExecFileOptions;
}): Promise<{ stdout: string; stderr: string }> {
  const launch = launchHere(props);
  const { stdout, stderr } = await run(launch.file, launch.args, {
    maxBuffer: MAX_BUFFER_BYTES,
    ...props.options,
    ...(props.options?.env === undefined
      ? {}
      : { env: envWithOnePath({ env: props.options.env, platform: process.platform }) }),
    encoding: 'utf8',
    windowsHide: true,
    windowsVerbatimArguments: launch.isVerbatim,
  });

  return { stdout, stderr };
}
