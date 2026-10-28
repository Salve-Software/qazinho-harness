/**
 * Lê o `adb devices`. Um aparelho que ainda não é `device` está ligando, então não está
 * pronto.
 */
export function parseDevices(stdout: string): string[] {
  return stdout
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(
      ([serial, state]) =>
        serial !== undefined && serial.length > 0 && state === 'device',
    )
    .map(([serial]) => serial ?? '');
}
