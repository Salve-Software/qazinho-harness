import { join } from 'node:path';

/**
 * Onde o app que mostra um simulador pode estar no Xcode do QA: o Simulator até o Xcode
 * 26, e o Device Hub, que o substituiu no 27.
 */
export function simulatorAppsOf(developer: string): { path: string; process: string }[] {
  return [
    { path: join(developer, 'Applications', 'Simulator.app'), process: 'Simulator' },
    {
      path: join(developer, '..', 'Applications', 'DeviceHub.app'),
      process: 'DeviceHub',
    },
  ];
}
