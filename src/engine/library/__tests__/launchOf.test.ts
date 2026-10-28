import { describe, expect, it } from 'vitest';
import { launchOf } from '@/engine/library';

/** O shim que o npm 10 escreve para o bin de um pacote, aqui o do Claude Code. */
const NPM_SHIM = [
  '@ECHO off',
  'GOTO start',
  ':find_dp0',
  'SET dp0=%~dp0',
  'EXIT /b',
  ':start',
  'SETLOCAL',
  'CALL :find_dp0',
  '',
  'IF EXIST "%dp0%\\node.exe" (',
  '  SET "_prog=%dp0%\\node.exe"',
  ') ELSE (',
  '  SET "_prog=node"',
  '  SET PATHEXT=%PATHEXT:;.JS;=;%',
  ')',
  '',
  'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\@anthropic-ai\\claude-code\\cli.js" %*',
].join('\r\n');

const SHIM_DIR = 'C:\\Users\\Ana\\AppData\\Roaming\\npm';

describe('launchOf', () => {
  it('runs a command as it is everywhere but Windows', () => {
    expect(
      launchOf({
        command: '/opt/homebrew/bin/claude',
        args: ['-p', 'oi'],
        platform: 'darwin',
        shim: null,
        node: 'node',
      }),
    ).toEqual({
      file: '/opt/homebrew/bin/claude',
      args: ['-p', 'oi'],
      isVerbatim: false,
    });
  });

  it('runs an .exe on Windows as it is', () => {
    expect(
      launchOf({
        command: 'C:\\Users\\Ana\\.local\\bin\\claude.exe',
        args: ['--version'],
        platform: 'win32',
        shim: null,
        node: 'node',
      }).file,
    ).toBe('C:\\Users\\Ana\\.local\\bin\\claude.exe');
  });

  /**
   * O Node se recusa a iniciar um .cmd sem shell, e o cmd.exe estragaria um argumento
   * JSON.
   */
  it('runs the script an npm shim points at with node, its arguments untouched', () => {
    const schema = '{"type":"object","properties":{"a":{"type":"string"}}}';

    expect(
      launchOf({
        command: `${SHIM_DIR}\\claude.cmd`,
        args: ['--json-schema', schema, '--tools', ''],
        platform: 'win32',
        shim: NPM_SHIM,
        node: 'C:\\Program Files\\nodejs\\node.exe',
      }),
    ).toEqual({
      file: 'C:\\Program Files\\nodejs\\node.exe',
      args: [
        `${SHIM_DIR}\\node_modules\\@anthropic-ai\\claude-code\\cli.js`,
        '--json-schema',
        schema,
        '--tools',
        '',
      ],
      isVerbatim: false,
    });
  });

  it('runs the .exe an older shim points at, with no node', () => {
    expect(
      launchOf({
        command: `${SHIM_DIR}\\codex.cmd`,
        args: ['exec'],
        platform: 'win32',
        shim: '@"%~dp0\\node_modules\\@openai\\codex\\bin\\codex.exe" %*',
        node: 'node',
      }),
    ).toEqual({
      file: `${SHIM_DIR}\\node_modules\\@openai\\codex\\bin\\codex.exe`,
      args: ['exec'],
      isVerbatim: false,
    });
  });

  it('runs any other .cmd through cmd.exe, each argument quoted and its specials escaped', () => {
    expect(
      launchOf({
        command: 'C:\\tools\\gh.cmd',
        args: ['api', 'repos?a=1&b=2', 'say "hi" 100%'],
        platform: 'win32',
        shim: '@echo off\r\nC:\\tools\\gh-real.exe %*',
        node: 'node',
      }),
    ).toEqual({
      file: 'cmd.exe',
      args: [
        '/d',
        '/s',
        '/c',
        '"C:\\tools\\gh.cmd ^"api^" ^"repos^?a=1^&b=2^" ^"say^ \\^"hi\\^"^ 100^%^""',
      ],
      isVerbatim: true,
    });
  });
});
