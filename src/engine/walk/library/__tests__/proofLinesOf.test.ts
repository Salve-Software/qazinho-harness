import { describe, expect, it } from 'vitest';
import { proofLinesOf } from '@/engine/walk/library';

describe('proofLinesOf', () => {
  it('reads each line of a proof as a thing of its own, blank ones left out', () => {
    expect(proofLinesOf('  1 item: Caneca \n\n Total: R$ 30,00 ')).toEqual([
      '1 item: Caneca',
      'Total: R$ 30,00',
    ]);
  });

  it('reads a proof of one line as itself, and an empty one as nothing', () => {
    expect(proofLinesOf('Visitas: 1')).toEqual(['Visitas: 1']);
    expect(proofLinesOf('   ')).toEqual([]);
  });
});
