import type { DevicePurpose } from '@/tools/servers/device/types';

export const TOOLS_LEFT_OUT: Record<DevicePurpose, readonly string[]> = {
  walk: ['screen', 'finish'],
  explore: ['report'],
  learn: [
    'report',
    'bug',
    'ask_qa',
    'say',
    'answer_qa',
    'screen',
    'finish',
    'upload',
    'long_press',
    'drag',
    'reopen',
  ],
};
