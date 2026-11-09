import { describe, expect, it } from 'vitest';
import { describeDownloads } from '@/engine/devices/WebDriver/library';

describe('describeDownloads', () => {
  it('says nothing before the first file', () => {
    expect(describeDownloads([])).toBeNull();
  });

  it('lists each file with how it stands', () => {
    expect(
      describeDownloads([
        { state: 'saved', name: 'a.pdf', path: '/a', size: 54_000 },
        { state: 'saved', name: 'b.zip', path: '/b', size: 3 * 1024 * 1024 },
        { state: 'saving', name: 'c.csv' },
        { state: 'failed', name: 'd.csv', failure: 'canceled' },
      ]),
    ).toBe(
      'DOWNLOADS (files the browser saved):\na.pdf, 53 KB\nb.zip, 3.0 MB\nc.csv, still downloading\nd.csv, failed: canceled',
    );
  });
});
