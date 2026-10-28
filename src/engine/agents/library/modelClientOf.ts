import type { IModelClient } from '@/engine/agents/types';
import type Anthropic from '@anthropic-ai/sdk';

/** O SDK da Anthropic como o agente do gateway o chama. */
export function modelClientOf(client: Anthropic): IModelClient {
  return {
    create: ({ body, signal }) => client.messages.create(body, { signal }),
  };
}
