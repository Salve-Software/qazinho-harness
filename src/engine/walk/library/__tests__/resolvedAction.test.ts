import { describe, expect, it } from 'vitest';
import { resolvedAction } from '@/engine/walk/library';

const VALUES = [
  { name: 'LOGIN_EMAIL', description: 'The admin', value: 'qa@shop.test' },
  { name: 'LOGIN_PASSWORD', description: 'Its password', value: 'p@$$ $& w0rd' },
];

describe('resolvedAction', () => {
  it('types the value of each variable a fill names, as it was saved', () => {
    expect(
      resolvedAction({
        action: { kind: 'fill', target: 'Password', value: '${LOGIN_PASSWORD}' },
        values: VALUES,
      }),
    ).toEqual({ kind: 'fill', target: 'Password', value: 'p@$$ $& w0rd' });
  });

  it('fills a variable inside other words, in the target and in a prompt too', () => {
    expect(
      resolvedAction({
        action: {
          kind: 'click',
          target: 'Signed in as ${LOGIN_EMAIL}',
          value: '',
          promptText: 'mail ${LOGIN_EMAIL} now',
        },
        values: VALUES,
      }),
    ).toEqual({
      kind: 'click',
      target: 'Signed in as qa@shop.test',
      value: '',
      promptText: 'mail qa@shop.test now',
    });
  });

  it('leaves an action with no variable as it was', () => {
    const action = { kind: 'fill', target: 'Coupon', value: 'SAVE$10' } as const;

    expect(resolvedAction({ action, values: VALUES })).toEqual(action);
  });

  it('does NOT type a variable the project does not keep, and names the ones it does', () => {
    expect(() =>
      resolvedAction({
        action: { kind: 'fill', target: 'Email', value: '${ADMIN_EMAIL}' },
        values: VALUES,
      }),
    ).toThrow(
      'The project keeps no variable called ${ADMIN_EMAIL}. It keeps ${LOGIN_EMAIL}, ${LOGIN_PASSWORD}.',
    );
    expect(() =>
      resolvedAction({
        action: { kind: 'fill', target: 'Email', value: '${ADMIN_EMAIL}' },
        values: [],
      }),
    ).toThrow('The project keeps no variables, so there is no ${ADMIN_EMAIL} to type.');
  });
});
