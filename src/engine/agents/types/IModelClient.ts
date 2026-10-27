import type Anthropic from '@anthropic-ai/sdk';

/**
 * What the gateway agent needs of Anthropic's SDK: one Messages API call, which ending
 * the turn aborts.
 */
export interface IModelClient {
  create: (props: {
    body: Anthropic.MessageCreateParamsNonStreaming;
    signal: AbortSignal;
  }) => Promise<Anthropic.Message>;
}
