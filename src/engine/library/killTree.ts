import { spawn } from 'node:child_process';

/** Signals an agent and everything it started: on POSIX the agent leads its own process group, and on Windows, which has no signals, taskkill ends the whole tree. */
export function killTree(
  child: {
    pid?: number | undefined;
    kill: (signal: NodeJS.Signals) => boolean;
  },
  signal: NodeJS.Signals = 'SIGTERM',
): void {
  if (child.pid === undefined) return;

  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      windowsHide: true,
      stdio: 'ignore',
    }).on('error', () => {
      child.kill('SIGTERM');
    });

    return;
  }

  try {
    process.kill(-child.pid, signal);
  } catch {
    child.kill(signal);
  }
}
