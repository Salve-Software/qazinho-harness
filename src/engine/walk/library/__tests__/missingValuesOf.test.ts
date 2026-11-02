import { describe, expect, it } from 'vitest';
import { missingValuesOf } from '@/engine/walk/library';

const step = (over: {
  action?: string;
  expected?: string;
  casePreconditions?: string;
}) => ({
  caseId: 'TC-01',
  caseTitle: 'Entrar',
  casePriority: 'P1',
  caseGoal: '',
  casePreconditions: '',
  numberInCase: 1,
  action: '',
  expected: '',
  ...over,
});

describe('missingValuesOf', () => {
  it('names what a step types and the run has no value for', () => {
    expect(
      missingValuesOf({
        steps: [step({ action: 'Digitar ${EMAIL} e ${SENHA}' })],
        values: [{ name: 'EMAIL' }],
      }),
    ).toEqual(['SENHA']);
  });

  it('reads the expected result and the preconditions too', () => {
    expect(
      missingValuesOf({
        steps: [step({ expected: 'Mostra ${NOME}', casePreconditions: 'Com ${CONTA}' })],
        values: [],
      }),
    ).toEqual(['NOME', 'CONTA']);
  });

  it('names each once', () => {
    expect(
      missingValuesOf({
        steps: [step({ action: '${A}' }), step({ action: '${A}' })],
        values: [],
      }),
    ).toEqual(['A']);
  });

  it('has nothing to say about a case with what it needs', () => {
    expect(
      missingValuesOf({
        steps: [step({ action: 'Digitar ${EMAIL}, R$ 10,00 e {nada}' })],
        values: [{ name: 'EMAIL' }],
      }),
    ).toEqual([]);
  });
});
