import type { OutsideCaller, OutsideToolCall } from '@/contract';

/** Quem executa a chamada de um agente de fora, sabendo qual chamou, e o que responde. */
export type OutsidePerform = (
  call: OutsideToolCall,
  caller: OutsideCaller,
) => Promise<{ text: string; isError: boolean }>;
