import type { IAttachDevice } from '@/tools/servers/device/types';

/**
 * Um turno do agente num caso: o system prompt da run, a mensagem que começa o caso, o
 * dispositivo em que as ferramentas agem, e as ferramentas que ele pode chamar.
 */
export interface ICaseTurn {
  scope: string;
  systemPrompt: string;
  prompt: string;
  device: IAttachDevice;
  allowedTools: string[];
}
