import { describe, expect, it } from 'vitest';
import { hiddenValues } from '@/engine/walk/library';

describe('hiddenValues', () => {
  it('reads each value on the screen back as its variable', () => {
    expect(
      hiddenValues({
        text: 'Welcome, qa@shop.test\n[field] Email: qa@shop.test',
        values: [{ name: 'LOGIN_EMAIL', description: '', value: 'qa@shop.test' }],
      }),
    ).toBe('Welcome, ${LOGIN_EMAIL}\n[field] Email: ${LOGIN_EMAIL}');
  });

  it('hides the longest value first, so a value inside another does not split it', () => {
    expect(
      hiddenValues({
        text: 'Code: secret-2026',
        values: [
          { name: 'SHORT', description: '', value: 'secret' },
          { name: 'LONG', description: '', value: 'secret-2026' },
        ],
      }),
    ).toBe('Code: ${LONG}');
  });

  it('does NOT hide a value too short to tell from an ordinary word', () => {
    expect(
      hiddenValues({
        text: 'Add one more',
        values: [{ name: 'PIN', description: '', value: 'one' }],
      }),
    ).toBe('Add one more');
  });
});
