import { describe, expect, it } from 'vitest';
import { CORPUS } from '@/context/constants';

describe('CORPUS', () => {
  it('reads every .md under corpus/, one section each', () => {
    expect(CORPUS.length).toBeGreaterThan(0);

    for (const file of CORPUS) expect(file.section.lines.length).toBeGreaterThan(0);
  });

  it('briefs every platform a project can target', () => {
    const platforms = CORPUS.filter(({ layer }) => layer === 'platform').map(
      ({ scope }) => scope,
    );

    expect(platforms.sort()).toEqual(['android', 'ios', 'web']);
  });

  it('has something for every role', () => {
    const roles = new Set(
      CORPUS.filter(({ layer }) => layer === 'role').map(({ scope }) => scope),
    );

    expect([...roles].sort()).toEqual([
      'assistant',
      'builder',
      'chat',
      'explorer',
      'keeper',
      'reader',
      'reporter',
      'runner',
    ]);
  });

  it('never gives two files of one layer and scope the same order, so the prompt never reshuffles', () => {
    const keys = CORPUS.map(
      ({ layer, scope, order }) => `${layer}/${String(scope)}/${String(order)}`,
    );

    expect(new Set(keys).size).toBe(keys.length);
  });
});
