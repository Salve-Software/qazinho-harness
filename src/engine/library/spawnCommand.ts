import type { ChildProcessWithoutNullStreams, SpawnOptions } from 'node:child_process';
import { spawn } from 'node:child_process';
import { envWithOnePath } from './envWithOnePath';
import { launchHere } from './launchHere';

/** Starts a command the way this platform needs, with no console window flashing up on Windows; its streams are pipes unless `stdio` says otherwise. */
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
