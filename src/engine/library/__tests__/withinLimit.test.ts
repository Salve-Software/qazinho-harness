import { describe, expect, it } from 'vitest';
import { withinLimit } from '@/engine/library/withinLimit';

describe('withinLimit', () => {
  it('answers what the work answered when it is on time', async () => {
    await expect(
      withinLimit({ work: Promise.resolve('tela'), ms: 50, said: 'demorou' }),
    ).resolves.toBe('tela');
  });

  it('refuses with the words given when the work hangs', async () => {
    await expect(
      withinLimit({ work: new Promise(() => undefined), ms: 5, said: 'demorou' }),
    ).rejects.toThrow('demorou');
  });

  it('passes on the failure of the work itself', async () => {
    await expect(
      withinLimit({
        work: Promise.reject(new Error('quebrou')),
        ms: 50,
        said: 'demorou',
      }),
    ).rejects.toThrow('quebrou');
  });
});
