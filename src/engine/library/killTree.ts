import { spawn } from 'node:child_process';

/**
 * Sinaliza um agente e tudo o que ele iniciou: no POSIX o agente lidera o próprio grupo
 * de processos, e no Windows, que não tem sinais, o taskkill encerra a árvore toda.
 */
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
