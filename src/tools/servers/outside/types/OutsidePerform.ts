import type { OutsideToolCall } from '@/contract';

/** Quem executa uma chamada de um agente de fora: o app, e o que ele responde. */
export type OutsidePerform = (
  call: OutsideToolCall,
) => Promise<{ text: string; isError: boolean }>;
