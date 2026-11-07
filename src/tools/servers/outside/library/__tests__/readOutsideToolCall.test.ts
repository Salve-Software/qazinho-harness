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

  it('creates a project with a target, and refuses one with no name', () => {
    expect(
      readOutsideToolCall({
        name: 'create_project',
        args: { name: 'Loja', web: 'http://localhost:3000' },
      }),
    ).toEqual({
      kind: 'call',
      call: {
        name: 'create_project',
        args: { name: 'Loja', web: 'http://localhost:3000' },
      },
    });
    expect(
      readOutsideToolCall({
        name: 'create_project',
        args: { web: 'http://localhost:3000' },
      }),
    ).toMatchObject({
      kind: 'refused',
      error: expect.stringContaining('name') as string,
    });
  });

  it('creates a workspace only on a target it knows', () => {
    expect(
      readOutsideToolCall({
        name: 'create_workspace',
        args: { project: 'Loja', name: 'Checkout', target: 'web' },
      }),
    ).toMatchObject({ kind: 'call' });
    expect(
      readOutsideToolCall({
        name: 'create_workspace',
        args: { project: 'Loja', name: 'Checkout', target: 'desktop' },
      }),
    ).toEqual({ kind: 'refused', error: '"target" is web, android or ios.' });
  });

  it('reads a change of the plan and a bug sent with the same schema as the assistant', () => {
    expect(
      readOutsideToolCall({
        name: 'delete_cases',
        args: { workspace: 'Compra', cases: ['TC-02'] },
      }),
    ).toEqual({
      kind: 'call',
      call: { name: 'delete_cases', args: { workspace: 'Compra', cases: ['TC-02'] } },
    });
    expect(
      readOutsideToolCall({
        name: 'delete_cases',
        args: { workspace: 'Compra', cases: [] },
      }),
    ).toEqual({
      kind: 'refused',
      error: '"delete_cases" needs at least one case id, such as TC-03.',
    });
    expect(
      readOutsideToolCall({
        name: 'send_bug',
        args: { workspace: 'Compra', bug: 'BUG-01', project: 'shop' },
      }),
    ).toMatchObject({ kind: 'call', call: { args: { project: 'SHOP' } } });
  });

  /** Um agente de fora nunca mexe em variáveis, nas configurações nem nas integrações. */
  it.each([
    'delete_variable',
    'update_variable',
    'ask_variables',
    'change_settings',
    'disconnect_integration',
    'approve_permission',
  ])('refuses %s, which is not offered to an outside agent', (name) => {
    expect(readOutsideToolCall({ name, args: {} })).toEqual({
      kind: 'refused',
      error: `There is no tool called "${name}".`,
    });
  });
});
