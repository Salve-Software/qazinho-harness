import { describe, expect, it } from 'vitest';
import { readChangeAnswer } from '@/library';

describe('readChangeAnswer', () => {
  it('reads a change the agent made, trimmed', () => {
    expect(
      readChangeAnswer(
        JSON.stringify({
          outcome: 'changed',
          summary: ' The menu says "Carrinho" now. ',
          commit: 'fix(hc-1139): find the cart by its new name',
          title: 'CT-NAV-002: find the cart by its new name',
          body: 'The menu link was renamed.',
        }),
      ),
    ).toEqual({
      outcome: 'changed',
      summary: 'The menu says "Carrinho" now.',
      commit: 'fix(hc-1139): find the cart by its new name',
      title: 'CT-NAV-002: find the cart by its new name',
      body: 'The menu link was renamed.',
    });
  });

  it('reads an app that is wrong', () => {
    expect(
      readChangeAnswer(
        JSON.stringify({
          outcome: 'app-bug',
          summary: 'The search ignores lower case.',
          commit: '',
          title: '',
          body: '',
        }),
      ),
    ).toMatchObject({ outcome: 'app-bug', commit: '' });
  });

  it('reads prose, or an answer out of the schema, as giving up, with the prose as why', () => {
    expect(readChangeAnswer('I could not open the suite.')).toEqual({
      outcome: 'gave-up',
      summary: 'I could not open the suite.',
      commit: '',
      title: '',
      body: '',
    });
    expect(readChangeAnswer(JSON.stringify({ outcome: 'fixed' }))).toMatchObject({
      outcome: 'gave-up',
    });
  });
});
