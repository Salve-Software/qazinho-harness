import { describe, expect, it } from 'vitest';
import { argsOf } from '@/engine/agents';

describe('argsOf', () => {
  it('takes an object as the arguments', () => {
    expect(argsOf({ target: 'Cart' })).toEqual({ target: 'Cart' });
  });

  it('takes nothing else as arguments', () => {
    expect(argsOf('Cart')).toBeUndefined();
    expect(argsOf(null)).toBeUndefined();
    expect(argsOf(['Cart'])).toBeUndefined();
  });
});
