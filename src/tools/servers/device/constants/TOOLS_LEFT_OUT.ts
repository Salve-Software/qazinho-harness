import type { DevicePurpose } from '@/tools/servers/device/types';

export const TOOLS_LEFT_OUT: Record<DevicePurpose, readonly string[]> = {
  walk: ['screen', 'finish'],
  explore: ['report', 'tab', 'open_download'],
  learn: [
    'report',
    'bug',
    'ask_qa',
    'say',
    'answer_qa',
    'tab',
    'screen',
    'finish',
    'upload',
    'open_download',
    'long_press',
    'drag',
    'reopen',
  ],
};
