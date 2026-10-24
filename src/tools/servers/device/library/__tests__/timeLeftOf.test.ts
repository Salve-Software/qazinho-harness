import { describe, expect, it } from 'vitest';
import { timeLeftOf } from '@/tools/servers/device/library';

describe('timeLeftOf', () => {
  it('rounds what is left to whole minutes', () => {
    expect(timeLeftOf(7 * 60_000 + 20_000)).toBe('About 7 minutes left.');
    expect(timeLeftOf(60_000)).toBe('About 1 minute left.');
  });

  it('asks for the finish once less than a minute is left', () => {
    expect(timeLeftOf(20_000)).toBe('Less than a minute is left: call finish soon.');
    expect(timeLeftOf(-5_000)).toBe('Less than a minute is left: call finish soon.');
  });
});
