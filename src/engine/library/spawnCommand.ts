import type { ChildProcessWithoutNullStreams, SpawnOptions } from 'node:child_process';
import { spawn } from 'node:child_process';
import { envWithOnePath } from './envWithOnePath';
import { launchHere } from './launchHere';

/**
 * Inicia um comando do jeito que esta plataforma pede, sem janela de console piscando no
 * Windows; os streams são pipes a menos que o `stdio` diga outra coisa.
 */
export function spawnCommand(props: {
  command: string;
  args: string[];
  options?: SpawnOptions;
}): ChildProcessWithoutNullStreams {
  const launch = launchHere(props);

  return spawn(launch.file, launch.args, {
    ...props.options,
    ...(props.options?.env === undefined
      ? {}
      : { env: envWithOnePath({ env: props.options.env, platform: process.platform }) }),
    windowsHide: true,
    windowsVerbatimArguments: launch.isVerbatim,
  }) as ChildProcessWithoutNullStreams;
}
