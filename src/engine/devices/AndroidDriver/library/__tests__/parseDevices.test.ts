import { describe, expect, it } from 'vitest';
import { parseDevices } from '@/engine/devices/AndroidDriver/library';

const LISTED = [
  'List of devices attached',
  'emulator-5554\tdevice',
  'emulator-5556\toffline',
  '',
].join('\n');

describe('parseDevices', () => {
  it('lists only what is ready to be driven', () => {
    expect(parseDevices(LISTED)).toEqual(['emulator-5554']);
  });

  it('a device still booting is not ready', () => {
    expect(parseDevices('List of devices attached\nemulator-5554\tbooting')).toEqual([]);
  });

  it('nothing attached is no devices, not a crash', () => {
    expect(parseDevices('List of devices attached\n')).toEqual([]);
  });

  it('adb saying nothing at all is no devices', () => {
    expect(parseDevices('')).toEqual([]);
  });
});
