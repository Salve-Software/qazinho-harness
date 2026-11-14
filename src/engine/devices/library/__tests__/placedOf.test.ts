import { describe, expect, it } from 'vitest';
import { placedOf } from '@/engine/devices/library';

describe('placedOf', () => {
  it('reads a control and the place it sits in', () => {
    expect(placedOf('Adicionar ao carrinho · Camiseta Básica')).toEqual({
      name: 'Adicionar ao carrinho',
      place: 'Camiseta Básica',
    });
  });

  /** O lugar é o que vem depois do último ponto: um nome pode ter um no meio. */
  it('takes the place after the last dot', () => {
    expect(placedOf('Plano · Pro · Mensal')).toEqual({
      name: 'Plano · Pro',
      place: 'Mensal',
    });
  });

  it('is nothing for a target with no place, or an empty side', () => {
    expect(placedOf('Adicionar ao carrinho')).toBeNull();
    expect(placedOf(' · Camiseta')).toBeNull();
    expect(placedOf('Comprar · ')).toBeNull();
  });
});
