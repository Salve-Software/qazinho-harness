import type { OutsideToolCall } from '@/contract';

/**
 * Uma chamada de um agente de fora lida contra o schema: o que o app executa, ou o que
 * responder ao agente.
 */
export type OutsideToolRead =
  { kind: 'call'; call: OutsideToolCall } | { kind: 'refused'; error: string };
