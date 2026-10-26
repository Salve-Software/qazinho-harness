import { describe, expect, it } from 'vitest';
import { parseSimulators } from '@/engine/devices/IosDriver/library';
import { SIMULATOR_LIST } from './SIMULATOR_LIST';

describe('parseSimulators', () => {
  it('lists the phones, in the order the tool reported them', () => {
    expect(parseSimulators(SIMULATOR_LIST)[0]).toBe(
      '38D42C3A-8353-4EB0-B5AD-03F8B163C662',
    );
  });

  it('leaves the iPads out, because a plan is drafted for a phone', () => {
    expect(parseSimulators(SIMULATOR_LIST)).toHaveLength(5);
  });

  it('a mac with no simulators has none', () => {
    expect(parseSimulators('== Devices ==\n')).toEqual([]);
  });
});
