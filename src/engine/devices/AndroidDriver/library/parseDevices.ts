/** Reads `adb devices`. A device that is not `device` yet is still booting, so it is not ready. */
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
