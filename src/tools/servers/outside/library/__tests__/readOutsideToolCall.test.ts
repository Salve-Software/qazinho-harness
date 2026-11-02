import { describe, expect, it } from 'vitest';
import { readOutsideToolCall } from '@/tools/servers/outside/library';

describe('readOutsideToolCall', () => {
  it('reads a run started on some cases', () => {
    expect(
      readOutsideToolCall({
        name: 'start_run',
        args: { workspace: 'Compra', cases: ['TC-01'], withAgent: true },
      }),
    ).toEqual({
      kind: 'call',
      call: {
        name: 'start_run',
        args: { workspace: 'Compra', cases: ['TC-01'], withAgent: true },
      },
    });
  });

  it('holds a status for at most 50 seconds, and says so', () => {
    expect(
      readOutsideToolCall({
        name: 'run_status',
        args: { workspace: 'w', waitSeconds: 50 },
      }),
    ).toMatchObject({ kind: 'call' });
    expect(
      readOutsideToolCall({
        name: 'run_status',
        args: { workspace: 'w', waitSeconds: 51 },
      }),
    ).toEqual({
      kind: 'refused',
      error: '"waitSeconds" is at most 50. Call it again to wait longer.',
    });
  });

  it('asks for at least one case to suggest, and for a summary', () => {
    expect(
      readOutsideToolCall({
        name: 'suggest_cases',
        args: { workspace: 'w', summary: 'New coupon', cases: [] },
      }),
    ).toEqual({ kind: 'refused', error: '"suggest_cases" needs at least one case.' });
    expect(
      readOutsideToolCall({ name: 'suggest_cases', args: { workspace: 'w', cases: [] } }),
    ).toMatchObject({
      kind: 'refused',
      error: expect.stringContaining('summary') as string,
    });
  });

  /** Um agente de fora nunca apaga, muda configurações nem mexe em variáveis. */
  it.each([
    'delete_project',
    'delete_workspace',
    'delete_variable',
    'update_variable',
    'ask_variables',
    'change_settings',
    'disconnect_integration',
    'send_bug',
    'approve_permission',
  ])('refuses %s, which is not offered to an outside agent', (name) => {
    expect(readOutsideToolCall({ name, args: {} })).toEqual({
      kind: 'refused',
      error: `There is no tool called "${name}".`,
    });
  });
});
