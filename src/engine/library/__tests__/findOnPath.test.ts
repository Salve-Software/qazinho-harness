import { chmodSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findOnPath } from '@/engine/library';

function directoryWith(props: { command: string; isExecutable: boolean }): string {
  const directory = mkdtempSync(join(tmpdir(), 'qazinho-path-'));
  const file = join(directory, props.command);

  writeFileSync(file, '#!/bin/sh\n');
  chmodSync(file, props.isExecutable ? 0o755 : 0o644);

  return directory;
}

describe('findOnPath', () => {
  it('answers with the binary it found', () => {
    const directory = directoryWith({ command: 'claude', isExecutable: true });

    expect(findOnPath({ command: 'claude', directories: [directory] })).toBe(
      join(directory, 'claude'),
    );
  });

  it('takes the first directory that has it, the way a shell would', () => {
    const first = directoryWith({ command: 'claude', isExecutable: true });
    const second = directoryWith({ command: 'claude', isExecutable: true });

    expect(findOnPath({ command: 'claude', directories: [first, second] })).toBe(
      join(first, 'claude'),
    );
  });

  it('does NOT accept a file that cannot be executed', () => {
    const directory = directoryWith({ command: 'claude', isExecutable: false });

    expect(findOnPath({ command: 'claude', directories: [directory] })).toBeNull();
  });

  it('answers null for an agent this machine does not have', () => {
    const directory = directoryWith({ command: 'claude', isExecutable: true });

    expect(findOnPath({ command: 'codex', directories: [directory] })).toBeNull();
  });

  it('walks past a directory that does not exist', () => {
    const directory = directoryWith({ command: 'claude', isExecutable: true });

    expect(findOnPath({ command: 'claude', directories: ['/nope', directory] })).toBe(
      join(directory, 'claude'),
    );
  });

  describe('on Windows', () => {
    function windowsDirectoryWith(names: string[]): string {
      const directory = mkdtempSync(join(tmpdir(), 'qazinho-path-win-'));

      for (const name of names) writeFileSync(join(directory, name), '');

      return directory;
    }

    it('finds a command by its .exe, before the npm .cmd shim beside it', () => {
      const directory = windowsDirectoryWith(['claude', 'claude.cmd', 'claude.exe']);

      expect(
        findOnPath({ command: 'claude', directories: [directory], platform: 'win32' }),
      ).toBe(join(directory, 'claude.exe'));
    });

    /**
     * O npm escreve um script sh sem extensão ao lado de cada .cmd; iniciá-lo falha no
     * Windows.
     */
    it('takes the npm .cmd shim, and never the sh script with no extension', () => {
      const directory = windowsDirectoryWith(['codex', 'codex.cmd', 'codex.ps1']);

      expect(
        findOnPath({ command: 'codex', directories: [directory], platform: 'win32' }),
      ).toBe(join(directory, 'codex.cmd'));
      expect(
        findOnPath({
          command: 'codex',
          directories: [windowsDirectoryWith(['codex'])],
          platform: 'win32',
        }),
      ).toBeNull();
    });

    it('takes a name that already says its extension as it is', () => {
      const directory = windowsDirectoryWith(['tar.exe']);

      expect(
        findOnPath({ command: 'tar.exe', directories: [directory], platform: 'win32' }),
      ).toBe(join(directory, 'tar.exe'));
    });
  });
});
