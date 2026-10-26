import { describe, expect, it } from 'vitest';
import { execCommand, spawnCommand } from '@/engine/library';

describe('execCommand', () => {
  it('answers with what the command printed', async () => {
    expect(
      await execCommand({
        command: process.execPath,
        args: ['-e', 'process.stdout.write(process.argv[1])', '{"a":"b c"}'],
        options: { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } },
      }),
    ).toEqual({ stdout: '{"a":"b c"}', stderr: '' });
  });

  it('rejects with what the command said when it fails', async () => {
    await expect(
      execCommand({
        command: process.execPath,
        args: ['-e', 'process.stderr.write("nope"); process.exit(3)'],
        options: { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } },
      }),
    ).rejects.toMatchObject({ code: 3, stderr: 'nope' });
  });
});

describe('spawnCommand', () => {
  it('starts a command with its streams piped', async () => {
    const child = spawnCommand({
      command: process.execPath,
      args: ['-e', 'process.stdin.pipe(process.stdout)'],
      options: { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } },
    });
    const heard = new Promise<string>((done) => {
      let said = '';

      child.stdout.on('data', (chunk: Buffer) => {
        said += chunk.toString();
      });
      child.on('close', () => {
        done(said);
      });
    });

    child.stdin.end('oi');

    expect(await heard).toBe('oi');
  });
});
