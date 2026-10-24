import { describe, expect, it } from 'vitest';
import { readAppToolCall } from '@/tools/servers/app/library';

describe('readAppToolCall', () => {
  it('reads a call that fits its schema into what the page carries out, trimmed', () => {
    expect(
      readAppToolCall({
        name: 'rename_workspace',
        args: { workspace: ' w-1 ', name: ' Checkout novo ' },
      }),
    ).toEqual({
      kind: 'call',
      call: {
        name: 'rename_workspace',
        args: { workspace: 'w-1', name: 'Checkout novo' },
      },
    });
  });

  it('keeps an empty target on a project change, which removes it', () => {
    expect(
      readAppToolCall({ name: 'update_project', args: { project: 'p-1', android: '' } }),
    ).toEqual({
      kind: 'call',
      call: { name: 'update_project', args: { project: 'p-1', android: '' } },
    });
  });

  it('reads a tool that takes nothing, whatever the agent leaves out', () => {
    expect(readAppToolCall({ name: 'go_home', args: undefined })).toEqual({
      kind: 'call',
      call: { name: 'go_home', args: {} },
    });
  });

  it('does NOT read a call that breaks the schema, and says why in the words the agent reads', () => {
    expect(readAppToolCall({ name: 'run_plan', args: { workspace: '  ' } })).toEqual({
      kind: 'refused',
      error: '"run_plan" needs "workspace": its id or its name.',
    });
    expect(
      readAppToolCall({ name: 'connect_integration', args: { integration: 'slack' } }),
    ).toEqual({ kind: 'refused', error: '"integration" is github or jira.' });
  });

  it('reads the Jira story a plan comes from by its key, in capitals, and nothing else as one', () => {
    expect(
      readAppToolCall({
        name: 'ask_workspace_chat',
        args: { workspace: 'Checkout', text: 'Planeja', story: ' shop-12 ' },
      }),
    ).toEqual({
      kind: 'call',
      call: {
        name: 'ask_workspace_chat',
        args: { workspace: 'Checkout', text: 'Planeja', story: 'SHOP-12' },
      },
    });
    expect(
      readAppToolCall({
        name: 'ask_workspace_chat',
        args: { workspace: 'Checkout', text: 'Planeja', story: 'the coupon story' },
      }),
    ).toEqual({
      kind: 'refused',
      error: '"story" is the key of a Jira story, such as SHOP-12.',
    });
  });

  it('reads where a bug goes: a Jira project by its key in capitals, or a repository as owner/name', () => {
    expect(
      readAppToolCall({
        name: 'send_bug',
        args: { workspace: 'Checkout', bug: 'BUG-02', project: ' shop ' },
      }),
    ).toEqual({
      kind: 'call',
      call: {
        name: 'send_bug',
        args: { workspace: 'Checkout', bug: 'BUG-02', project: 'SHOP' },
      },
    });
    expect(
      readAppToolCall({
        name: 'send_bug',
        args: { workspace: 'Checkout', bug: 'BUG-02', repository: 'the shop repo' },
      }),
    ).toEqual({
      kind: 'refused',
      error: '"repository" is a GitHub repository, as owner/name.',
    });
  });

  it('refuses a settings change that changes nothing', () => {
    expect(readAppToolCall({ name: 'change_settings', args: {} })).toEqual({
      kind: 'refused',
      error: '"change_settings" needs at least one of theme, language or runAlert.',
    });
  });

  it('refuses a tool it does not have', () => {
    expect(readAppToolCall({ name: 'format_disk', args: {} })).toEqual({
      kind: 'refused',
      error: 'There is no tool called "format_disk".',
    });
  });
});
