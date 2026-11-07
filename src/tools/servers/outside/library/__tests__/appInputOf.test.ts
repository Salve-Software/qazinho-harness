import { describe, expect, it } from 'vitest';
import { appInputOf } from '@/tools/servers/outside/library/appInputOf';

describe('appInputOf', () => {
  it("hands the assistant's own schema, so both read a call alike", () => {
    expect(
      appInputOf('dismiss_bug').safeParse({ workspace: 'w', bug: 'BUG-01' }).success,
    ).toBe(true);
  });

  it('refuses a call that breaks it', () => {
    expect(appInputOf('dismiss_bug').safeParse({ workspace: 'w' }).success).toBe(false);
  });
});
