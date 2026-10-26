import { spawn } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { killTree } from '@/engine/library';

describe.skipIf(process.platform === 'win32')('killTree', () => {
  it('ends a grandchild that still holds the output pipe, not just the agent', async () => {
    const agent = spawn('sh', ['-c', 'sleep 60 & wait'], {
      stdio: ['ignore', 'pipe', 'ignore'],
      detached: true,
    });
    const closed = new Promise<number>((resolve) => {
      const began = Date.now();

      agent.on('close', () => {
        resolve(Date.now() - began);
      });
    });

    await new Promise((wake) => setTimeout(wake, 200));
    killTree(agent);

    expect(await closed).toBeLessThan(2_000);
  });

  it('does nothing to a process that never started', () => {
    expect(() => {
      killTree({ pid: undefined, kill: () => true });
    }).not.toThrow();
  });
});
