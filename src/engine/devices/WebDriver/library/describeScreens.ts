import type { IDeviceScreen } from '@/contract';

/** As telas abertas como o agente as lê, com a que ele usa; uma tela só não diz nada. */
export function describeScreens(screens: IDeviceScreen[]): string | null {
  if (screens.length < 2) return null;

  const accounts = new Set(screens.map(({ account }) => account)).size;

  return [
    `SCREENS (${String(screens.length)} open, tab with "switch" and a number moves you):`,
    ...screens.map(
      ({ id, url, isAgent, account }) =>
        `${String(id)}: ${url}${accounts > 1 ? ` (account ${String(account)})` : ''}${isAgent ? ' <- you are here' : ''}`,
    ),
  ].join('\n');
}
