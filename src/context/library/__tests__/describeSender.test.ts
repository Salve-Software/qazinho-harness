import { describe, expect, it } from 'vitest';
import { describeSender } from '@/context/library';

describe('describeSender', () => {
  it('names the coding agent as who wrote it', () => {
    expect(describeSender(true).lines[0]).toContain('coding agent');
  });

  /** Uma seção sem linhas some da mensagem: a do QA não ganha nada. */
  it('says nothing when the QA wrote it', () => {
    expect(describeSender(false).lines).toEqual([]);
  });
});
