import type { IAttachDevice } from '@/tools/servers/device/types';

/** One agent turn on one case: the run's system prompt, the message that starts the case, the device its tools act on, and the tools it may call. */
export interface ICaseTurn {
  scope: string;
  systemPrompt: string;
  prompt: string;
  device: IAttachDevice;
  allowedTools: string[];
}
