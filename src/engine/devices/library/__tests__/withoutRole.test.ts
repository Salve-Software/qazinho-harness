import { describe, expect, it } from 'vitest';
import { withoutRole } from '@/engine/devices/library';

/** The agent copies a control the way look lists it, "button: Entrar", and that is not its name. */
describe('withoutRole', () => {
  it('reads the name out of a control as look lists it', () => {
    expect(withoutRole('button: Entrar')).toBe('Entrar');
    expect(withoutRole('a: Ver produtos')).toBe('Ver produtos');
    expect(withoutRole('button: Comprar #2')).toBe('Comprar #2');
  });

  it('gives nothing for a name that is not in that shape', () => {
    expect(withoutRole('Entrar')).toBeNull();
    expect(withoutRole('Total: R$ 79,90')).toBeNull();
    expect(withoutRole('https://loja.test')).toBeNull();
  });
});
