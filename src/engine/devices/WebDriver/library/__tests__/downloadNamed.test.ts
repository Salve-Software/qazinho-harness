import type { WebDownload } from '@/engine/devices/WebDriver/types';
import { describe, expect, it } from 'vitest';
import { downloadNamed } from '@/engine/devices/WebDriver/library';

const saved = (name: string): WebDownload => ({
  state: 'saved',
  name,
  path: `/tmp/${name}`,
  size: 10,
});

describe('downloadNamed', () => {
  it('waits while the browser saved nothing yet', () => {
    expect(downloadNamed({ downloads: [], name: '' }).kind).toBe('waiting');
  });

  it('takes the latest when no name is given', () => {
    expect(
      downloadNamed({ downloads: [saved('a.pdf'), saved('b.pdf')], name: '' }),
    ).toMatchObject({ kind: 'saved', file: { name: 'b.pdf' } });
  });

  it('finds a name in any case, the newest of two alike', () => {
    expect(
      downloadNamed({
        downloads: [
          { ...saved('A.pdf'), path: '/old' } as WebDownload,
          { ...saved('a.pdf'), path: '/new' } as WebDownload,
        ],
        name: 'a.PDF',
      }),
    ).toMatchObject({ kind: 'saved', file: { path: '/new' } });
  });

  it('takes the only file when its name changed, as one with the date in it', () => {
    expect(
      downloadNamed({ downloads: [saved('proposta-10.pdf')], name: 'proposta-09.pdf' }),
    ).toMatchObject({ kind: 'saved', file: { name: 'proposta-10.pdf' } });
  });

  it('refuses a name that matches none of several, listing them', () => {
    const pick = downloadNamed({
      downloads: [saved('a.pdf'), saved('b.pdf')],
      name: 'c.pdf',
    });

    expect(pick.kind).toBe('refused');
    expect(pick).toMatchObject({ why: expect.stringContaining('a.pdf, b.pdf') });
  });

  it('waits for one still downloading, and refuses one that failed', () => {
    expect(
      downloadNamed({ downloads: [{ state: 'saving', name: 'a.pdf' }], name: '' }).kind,
    ).toBe('waiting');
    expect(
      downloadNamed({
        downloads: [{ state: 'failed', name: 'a.pdf', failure: 'canceled' }],
        name: '',
      }),
    ).toMatchObject({ kind: 'refused', why: expect.stringContaining('canceled') });
  });
});
