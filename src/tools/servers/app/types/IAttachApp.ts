import type { AppToolCall } from '@/contract';

/**
 * Quem executa as ferramentas do app durante um turno do assistente, no escopo que o
 * endereço traz.
 */
export interface IAttachApp {
  scope: string;
  perform: (call: AppToolCall) => Promise<{ text: string; isError: boolean }>;
}
