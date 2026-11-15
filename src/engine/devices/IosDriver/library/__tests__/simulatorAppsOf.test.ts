import { describe, expect, it } from 'vitest';
import { simulatorAppsOf } from '@/engine/devices/IosDriver/library';

describe('simulatorAppsOf', () => {
  /** O Xcode 27 não traz mais o Simulator.app: o Device Hub mostra os simuladores. */
  it('looks for the Simulator first, then the Device Hub of a newer Xcode', () => {
    expect(simulatorAppsOf('/Applications/Xcode.app/Contents/Developer')).toEqual([
      {
        path: '/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app',
        process: 'Simulator',
      },
      {
        path: '/Applications/Xcode.app/Contents/Applications/DeviceHub.app',
        process: 'DeviceHub',
      },
    ]);
  });
});
