import { describe, expect, it } from 'vitest';
import { criteriaOf } from '@/context/library';

describe('criteriaOf', () => {
  it('reads a list of criteria, a line that goes on joined to its item', () => {
    expect(
      criteriaOf([
        {
          field: 'Acceptance criteria',
          text: 'Critérios:\n- Um cupom válido tira o desconto\n  do subtotal\n* Um cupom vencido é recusado\n1. O limite vale por pessoa',
        },
      ]),
    ).toEqual([
      'Um cupom válido tira o desconto do subtotal',
      'Um cupom vencido é recusado',
      'O limite vale por pessoa',
    ]);
  });

  it('reads each paragraph as a criterion when the text has no list, a Gherkin one too', () => {
    expect(
      criteriaOf([
        {
          field: 'Gherkin',
          text: 'Cenário: cupom válido\nDado um carrinho\nEntão o desconto aparece\n\nCenário: cupom vencido\nEntão um erro aparece',
        },
      ]),
    ).toEqual([
      'Cenário: cupom válido Dado um carrinho Então o desconto aparece',
      'Cenário: cupom vencido Então um erro aparece',
    ]);
  });

  it('numbers across every field the team uses, and none for an empty one', () => {
    expect(
      criteriaOf([
        { field: 'A', text: '- one' },
        { field: 'B', text: '  ' },
        { field: 'C', text: '- two' },
      ]),
    ).toEqual(['one', 'two']);
  });
});
