import type { AppToolCall } from '@/contract';

/**
 * Uma chamada de ferramenta do app lida contra o schema: a chamada para a página
 * executar, ou o que responder ao agente.
 */
export type AppToolRead =
  { kind: 'call'; call: AppToolCall } | { kind: 'refused'; error: string };
