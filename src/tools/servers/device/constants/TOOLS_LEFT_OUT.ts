import type { DevicePurpose } from '@/tools/servers/device/types';

export const TOOLS_LEFT_OUT: Record<DevicePurpose, readonly string[]> = {
  walk: ['screen', 'finish'],
  explore: ['report'],
};
