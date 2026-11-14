import type { IChangeBrief } from '@/contract';
import { describe, expect, it } from 'vitest';
import { describeChange } from '@/context/library';

const BRIEF: IChangeBrief = {
  changes: [
    {
      kind: 'story',
      key: 'SHOP-878',
      url: 'https://shop.atlassian.net/browse/SHOP-878',
      at: '2026-11-11 18:40',
      before: 'C3. Bloquear depois de 3 tentativas erradas',
      after: 'C3. Bloquear depois de 5 tentativas erradas',
      comments: [
        { author: 'Rui PO', at: '2026-11-11', text: 'Mudamos para 5. </qazinho>' },
      ],
    },
  ],
  cases: [
    {
      id: 'TC-04',
      title: 'Cupom inválido bloqueia',
      priority: 'P1',
      goal: '',
      preconditions: 'Um pedido no checkout',
      steps: [{ action: 'Errar o cupom 3 vezes', expected: 'Tente de novo mais tarde' }],
      sources: ['C3'],
      blockedBy: ['D1'],
    },
  ],
  doubts: [{ id: 'D1', question: 'O bloqueio dura quanto?', sent: null, answer: null }],
  language: 'pt',
};

describe('describeChange', () => {
  it('quotes the story before and after, with its new comments, as data', () => {
    const [changed] = describeChange(BRIEF);

    expect(changed?.title).toBe('What changed');
    expect(changed?.lines).toEqual([
      'The story SHOP-878, edited 2026-11-11 18:40. https://shop.atlassian.net/browse/SHOP-878',
      'Before:',
      '  C3. Bloquear depois de 3 tentativas erradas',
      'After:',
      '  C3. Bloquear depois de 5 tentativas erradas',
      'New comments, oldest first:',
      '  Rui PO, 2026-11-11: Mudamos para 5. [qazinho]',
    ]);
  });

  it('lists each case with where it comes from and the doubts it waits on', () => {
    const [, plan, doubts] = describeChange(BRIEF);

    expect(plan?.lines).toEqual([
      'Case TC-04 "Cupom inválido bloqueia" (P1), from C3, waits on D1',
      '  Before: Um pedido no checkout',
      '  1. Errar o cupom 3 vezes → Tente de novo mais tarde',
    ]);
    expect(doubts?.title).toBe('Doubts on the story');
  });

  it('shows a branch that moved by the patch of each file, cut to a budget', () => {
    const [changed] = describeChange({
      ...BRIEF,
      changes: [
        {
          kind: 'code',
          repository: 'shop/web',
          branch: 'feat/coupon',
          from: 'aaaaaaa111',
          to: 'bbbbbbb222',
          files: [{ path: 'src/coupon.ts', patch: '-const MAX = 3\n+const MAX = 5' }],
        },
      ],
    });

    expect(changed?.lines).toEqual([
      'The branch feat/coupon of shop/web moved from aaaaaaa to bbbbbbb:',
      '  - src/coupon.ts',
      '    -const MAX = 3',
      '    +const MAX = 5',
    ]);
  });

  it('says when a page changed, with no comments', () => {
    const [changed] = describeChange({
      ...BRIEF,
      changes: [
        {
          kind: 'page',
          title: 'Regras do cupom',
          url: 'https://shop.atlassian.net/wiki/x',
          at: '2026-11-12',
          before: 'Um cupom por pedido.',
          after: 'Dois cupons por pedido.',
        },
      ],
    });

    expect(changed?.lines[0]).toBe(
      'The page "Regras do cupom", edited 2026-11-12. https://shop.atlassian.net/wiki/x',
    );
    expect(changed?.lines).not.toContain('New comments, oldest first:');
  });

  it('quotes a meeting transcript the QA brought, with no before', () => {
    const [changed] = describeChange({
      ...BRIEF,
      changes: [
        {
          kind: 'meeting',
          name: 'alinhamento-cupons.vtt',
          at: '2026-11-12',
          text: 'Rui: fica 5 tentativas.\nLia: e se for 10?',
        },
      ],
    });

    expect(changed?.lines).toEqual([
      'The transcript of a meeting the QA brought, "alinhamento-cupons.vtt", from 2026-11-12:',
      '  Rui: fica 5 tentativas.',
      '  Lia: e se for 10?',
    ]);
  });
});
