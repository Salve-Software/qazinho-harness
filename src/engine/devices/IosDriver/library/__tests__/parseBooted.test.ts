import { describe, expect, it } from 'vitest';
import { parseBooted } from '@/engine/devices/IosDriver/library';
import { SIMULATOR_LIST } from './SIMULATOR_LIST';

describe('parseBooted', () => {
  it('names only the simulator that is already running', () => {
    expect(parseBooted(SIMULATOR_LIST)).toEqual(['38D42C3A-8353-4EB0-B5AD-03F8B163C662']);
  });

  it('nothing booted is nothing to drive', () => {
    expect(
      parseBooted('    iPhone 17 (D1739AFF-A610-42F9-88B9-57DDFF09562C) (Shutdown)'),
    ).toEqual([]);
  });
});
