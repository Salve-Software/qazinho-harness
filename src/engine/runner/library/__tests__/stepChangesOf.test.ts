import type { ICaseRecipe } from '@/contract';
import { describe, expect, it } from 'vitest';
import { stepChangesOf } from '@/engine/runner/library';

const click = (target: string, locator: string) => ({
  kind: 'click' as const,
  target,
  value: '',
  locator,
});

const recipe = (steps: ICaseRecipe['steps'], caseId = 'c1'): ICaseRecipe => ({
  caseId,
  fingerprint: 'f1',
  targetKind: 'web',
  steps,
  runId: '',
  recordedAt: 0,
});

const OLD = {
  number: 1,
  actions: [click('Entrar', "getByRole('button')")],
  proof: 'Bem-vindo',
};

describe('stepChangesOf', () => {
  it('names how a step was and how it is now', () => {
    const after = { ...OLD, actions: [click('Acessar', "getByRole('link')")] };
    const changes = stepChangesOf({
      book: { cases: [recipe([OLD])] },
      recorded: [recipe([after])],
    });

    expect(changes.get('c1')?.get(1)).toEqual({
      before: { actions: OLD.actions, proof: 'Bem-vindo' },
      after: { actions: after.actions, proof: 'Bem-vindo' },
    });
  });

  // Regravou igual: a gravação antiga falhou sem o caminho ter mudado, sinal de instabilidade.
  it('says null for a step recorded just as it was', () => {
    const changes = stepChangesOf({
      book: { cases: [recipe([OLD])] },
      recorded: [recipe([{ ...OLD }])],
    });

    expect(changes.get('c1')?.get(1)).toBeNull();
  });

  it('counts a step the old recording did not have as new', () => {
    const changes = stepChangesOf({
      book: { cases: [recipe([])] },
      recorded: [recipe([OLD])],
    });

    expect(changes.get('c1')?.get(1)?.before).toEqual({ actions: [], proof: '' });
  });

  it('leaves out a case that had no recording', () => {
    const changes = stepChangesOf({ book: { cases: [] }, recorded: [recipe([OLD])] });

    expect(changes.has('c1')).toBe(false);
  });

  it('does NOT compare against a recording of what the case used to say', () => {
    const changes = stepChangesOf({
      book: { cases: [{ ...recipe([OLD]), fingerprint: 'other' }] },
      recorded: [recipe([OLD])],
    });

    expect(changes.has('c1')).toBe(false);
  });
});
