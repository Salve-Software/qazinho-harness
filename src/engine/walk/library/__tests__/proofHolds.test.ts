import { describe, expect, it } from 'vitest';
import { proofHolds } from '@/engine/walk/library';

describe('proofHolds', () => {
  it('finds the proof on the screen, case and spacing aside', () => {
    expect(
      proofHolds({ screen: 'TEXT:\nVISITAS:   1\nSalvar visita', proof: 'Visitas: 1' }),
    ).toBe(true);
  });

  it('does NOT hold when the screen says something else', () => {
    expect(proofHolds({ screen: 'Visitas: 0', proof: 'Visitas: 1' })).toBe(false);
  });

  it('holds a proof of several lines only when the screen shows each of them', () => {
    const proof = '1 item: Caneca\nTotal: R$ 30,00';

    expect(proofHolds({ screen: '1 item: Caneca\nTotal: R$ 30,00', proof })).toBe(true);
    expect(proofHolds({ screen: '1 item: Caneca\nTotal: R$ 40,00', proof })).toBe(false);
  });

  it('does NOT hold on an empty proof, which proves nothing', () => {
    expect(proofHolds({ screen: 'anything', proof: '   ' })).toBe(false);
  });
});
