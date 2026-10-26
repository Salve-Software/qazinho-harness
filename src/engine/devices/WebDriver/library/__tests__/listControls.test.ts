import { describe, expect, it } from 'vitest';
import { listControls } from '@/engine/devices/WebDriver/library';
import { fakePage } from './fakePage';

describe('listControls', () => {
  it('hands back what the page listed, in page order', async () => {
    const controls = [{ role: 'button', label: 'Comprar', at: 2 }];

    expect(
      await listControls(fakePage({ $$eval: () => Promise.resolve(controls) })),
    ).toEqual(controls);
  });

  it('lists nothing for a page that refuses to be read, instead of breaking the look', async () => {
    expect(
      await listControls(
        fakePage({ $$eval: () => Promise.reject(new Error('detached')) }),
      ),
    ).toEqual([]);
  });
});
