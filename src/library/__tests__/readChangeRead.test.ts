import type { IChangeBrief } from '@/contract';
import { describe, expect, it } from 'vitest';
import { readChangeRead } from '@/library';

const CASE = {
  title: 'Cupom inválido bloqueia',
  priority: 'P1' as const,
  goal: '',
  preconditions: '',
  steps: [{ action: 'Errar o cupom 5 vezes', expected: 'Tente de novo mais tarde' }],
  sources: ['C3'],
};

const BRIEF: IChangeBrief = {
  changes: [],
  cases: [{ ...CASE, id: 'TC-04' }],
  doubts: [
    { id: 'D1', question: 'Quanto dura?', sent: null, answer: null },
    {
      id: 'D2',
      question: 'Vale no app?',
      sent: null,
      answer: { text: 'Sim', by: 'Rui', at: '2026-11-11' },
    },
  ],
  language: 'pt',
};

const read = (answer: unknown) =>
  readChangeRead({ text: JSON.stringify(answer), brief: BRIEF });

describe('readChangeRead', () => {
  it('reads each touched case as it will be, keeping the id of the case', () => {
    expect(
      read({
        summary: ' O critério 3 passou de 3 para 5 tentativas. ',
        changes: [{ caseId: 'TC-04', why: 'C3 diz 5', case: CASE }],
        added: [],
        doubts: [],
        answered: [],
      }),
    ).toEqual({
      summary: 'O critério 3 passou de 3 para 5 tentativas.',
      changes: [{ caseId: 'TC-04', why: 'C3 diz 5', case: { ...CASE, id: 'TC-04' } }],
      added: [],
      doubts: [],
      answered: [],
    });
  });

  /** O leitor não inventa caso nem dúvida: só toca o que recebeu. */
  it('drops a case and a doubt the reader was never given, or already answered', () => {
    const answer = read({
      summary: 'Mudou.',
      changes: [{ caseId: 'TC-99', why: 'x', case: CASE }],
      added: [{ why: 'Novo', case: { ...CASE, sources: null } }],
      doubts: ['O app e a página discordam?'],
      answered: [
        { doubtId: 'D1', text: 'Dura 10 minutos.' },
        { doubtId: 'D2', text: 'De novo' },
        { doubtId: 'D7', text: 'Nada' },
      ],
    });

    expect(answer?.changes).toEqual([]);
    expect(answer?.added).toEqual([{ why: 'Novo', case: { ...CASE, sources: [] } }]);
    expect(answer?.doubts).toEqual(['O app e a página discordam?']);
    expect(answer?.answered).toEqual([{ doubtId: 'D1', text: 'Dura 10 minutos.' }]);
  });

  it('reads the nulls Codex writes for what it left out', () => {
    expect(
      read({
        summary: 'Nada que os casos testem mudou.',
        changes: [],
        added: [],
        doubts: [],
        answered: [],
        extra: null,
      })?.summary,
    ).toBe('Nada que os casos testem mudou.');
  });

  it('gives nothing for an answer that is not a reading', () => {
    expect(readChangeRead({ text: 'not json', brief: BRIEF })).toBeNull();
    expect(read({ summary: '' })).toBeNull();
  });
});
