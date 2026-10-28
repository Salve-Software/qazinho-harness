import type Anthropic from '@anthropic-ai/sdk';

/**
 * O que o agente do gateway precisa do SDK da Anthropic: uma chamada da Messages API, que
 * terminar o turno aborta.
 */
export interface IModelClient {
  create: (props: {
    body: Anthropic.MessageCreateParamsNonStreaming;
    signal: AbortSignal;
  }) => Promise<Anthropic.Message>;
}
