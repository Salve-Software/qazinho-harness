import type { ILaunch } from '@/engine/types';
import { existsSync, readFileSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';
import { findOnPath } from './findOnPath';
import { launchOf } from './launchOf';

/**
 * Como iniciar um comando nesta máquina, um shim do npm no Windows lido do disco e o node
 * dele achado ao lado ou no PATH.
 */
export function launchHere(props: { command: string; args: string[] }): ILaunch {
  const shim = shimOf(props.command);

  return launchOf({
    ...props,
    platform: process.platform,
    shim,
    node: shim === null ? 'node' : nodeNear(props.command),
  });
}

function shimOf(command: string): string | null {
  if (process.platform !== 'win32' || !/\.(cmd|bat)$/i.test(command)) return null;

  try {
    return readFileSync(command, 'utf8');
  } catch {
    return null;
  }
}

function nodeNear(command: string): string {
  const beside = join(dirname(command), 'node.exe');

  if (existsSync(beside)) return beside;

  return (
    findOnPath({
      command: 'node',
      directories: (process.env.PATH ?? '').split(delimiter),
    }) ?? 'node'
  );
}
