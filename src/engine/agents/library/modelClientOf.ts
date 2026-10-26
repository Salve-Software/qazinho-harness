import type { IModelClient } from '@/engine/agents/types';
import type Anthropic from '@anthropic-ai/sdk';

/** Anthropic's SDK as the gateway agent calls it. */
export function modelClientOf(client: Anthropic): IModelClient {
  return {
    create: ({ body, signal }) => client.messages.create(body, { signal }),
  };
}
