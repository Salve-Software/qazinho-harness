import { describe, expect, it } from 'vitest';
import { ordinalOf } from '@/engine/devices/library';

describe('ordinalOf', () => {
  it('reads a number after the name as which of several', () => {
    expect(ordinalOf('Comprar #2')).toEqual({
      name: 'Comprar',
      nth: 1,
      isNumbered: true,
    });
  });

  it('takes a name with no number as the first, and says it had none', () => {
    expect(ordinalOf('  Aplicar cupom ')).toEqual({
      name: 'Aplicar cupom',
      nth: 0,
      isNumbered: false,
    });
  });

  it('tells "#1" from no number, since #1 points at the list', () => {
    expect(ordinalOf('Entrar #1')).toEqual({ name: 'Entrar', nth: 0, isNumbered: true });
  });

  it('leaves a # that is part of the name alone', () => {
    expect(ordinalOf('#submit')).toEqual({ name: '#submit', nth: 0, isNumbered: false });
    expect(ordinalOf('Pedido #1042 detalhes')).toEqual({
      name: 'Pedido #1042 detalhes',
      nth: 0,
      isNumbered: false,
    });
  });

  it('reads #0 as the first, never as before it', () => {
    expect(ordinalOf('Comprar #0')).toEqual({
      name: 'Comprar',
      nth: 0,
      isNumbered: true,
    });
  });
});
