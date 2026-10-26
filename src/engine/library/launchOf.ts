import type { ILaunch } from '@/engine/types';
import { win32 } from 'node:path';

const SHIM_TARGET = /"%~?dp0%?\\([^"]+)"\s*%\*/i;
const CMD_SPECIAL = /([()\][%!^"`<>&|;, *?])/g;

function quotedForCmd(arg: string): string {
  const quoted = `"${arg.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\*)$/, '$1$1')}"`;

  return quoted.replace(CMD_SPECIAL, '^$1');
}

/** How to start a command on this platform: as it is, or on Windows an npm .cmd shim as the script or .exe it points at, run by node, and any other .cmd through cmd.exe with every argument escaped. */
export function launchOf(props: {
  command: string;
  args: string[];
  platform: NodeJS.Platform;
  shim: string | null;
  node: string;
}): ILaunch {
  const { command, args } = props;

  if (props.platform !== 'win32' || !/\.(cmd|bat)$/i.test(command))
    return { file: command, args, isVerbatim: false };

  const target = props.shim === null ? undefined : SHIM_TARGET.exec(props.shim)?.[1];

  if (target !== undefined) {
    const script = win32.join(win32.dirname(command), target);

    return /\.exe$/i.test(script)
      ? { file: script, args, isVerbatim: false }
      : { file: props.node, args: [script, ...args], isVerbatim: false };
  }

  const line = [command.replace(CMD_SPECIAL, '^$1'), ...args.map(quotedForCmd)].join(' ');

  return { file: 'cmd.exe', args: ['/d', '/s', '/c', `"${line}"`], isVerbatim: true };
}
