import type { IGatewayAgent, IModelClient } from './types';
import type { CaseTurnEnd, ICaseAgent, ICaseTurn } from '@/engine/walk/types';
import Anthropic from '@anthropic-ai/sdk';
import { callDeviceTool } from '@/tools/servers/device/library';
import { GATEWAY_AGENT } from './constants';
import { argsOf, deviceToolsOf, toolResultOf, turnFailureOf } from './library';

/**
 * Anda um caso pela Messages API da Anthropic com as chamadas de ferramenta feitas aqui,
 * no dispositivo: o agente do CI, que chega ao modelo pelo gateway do QAzinho.
 */
export class GatewayAgent implements ICaseAgent {
  private readonly client: IModelClient;
  private readonly model: string;
  private readonly turns = new Map<string, AbortController>();

  public constructor(props: IGatewayAgent) {
    this.client = props.client;
    this.model = props.model;
  }

  /**
   * Um turno de um caso: cada chamada de ferramenta do modelo é feita no dispositivo e
   * respondida, até ele terminar o turno, as chamadas acabarem ou o turno ser cancelado.
   */
  public async walk(turn: ICaseTurn): Promise<CaseTurnEnd> {
    const controller = new AbortController();
    const tools = deviceToolsOf(turn.device.purpose ?? 'walk');
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: turn.prompt }];

    this.turns.get(turn.scope)?.abort();
    this.turns.set(turn.scope, controller);

    try {
      for (let calls = 0; calls < GATEWAY_AGENT.maxCalls; calls += 1) {
        const answer = await this.client.create({
          body: {
            model: this.model,
            max_tokens: GATEWAY_AGENT.maxTokens,
            cache_control: { type: 'ephemeral' },
            system: turn.systemPrompt,
            tools,
            messages,
          },
          signal: controller.signal,
        });
        const uses = answer.content.filter(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
        );

        messages.push({ role: 'assistant', content: answer.content });

        if (uses.length === 0 || answer.stop_reason === 'refusal')
          return { kind: 'ended', costUsd: null };

        const results: Anthropic.ToolResultBlockParam[] = [];

        for (const use of uses) {
          if (controller.signal.aborted) return { kind: 'ended', costUsd: null };

          results.push(
            toolResultOf({
              id: use.id,
              answer: await callDeviceTool({
                device: turn.device,
                call: { name: use.name, args: argsOf(use.input) },
              }),
            }),
          );
        }

        if (controller.signal.aborted) return { kind: 'ended', costUsd: null };

        messages.push({ role: 'user', content: results });
      }

      return { kind: 'ended', costUsd: null };
    } catch (reason) {
      if (controller.signal.aborted) return { kind: 'ended', costUsd: null };

      if (reason instanceof Anthropic.APIError && reason.status === GATEWAY_AGENT.capped)
        return { kind: 'capped', costUsd: null };

      return { kind: 'failed', reason: turnFailureOf(reason), costUsd: null };
    } finally {
      if (this.turns.get(turn.scope) === controller) this.turns.delete(turn.scope);
    }
  }

  /**
   * Termina o turno em andamento de um escopo: a chamada em voo é abortada e nenhuma
   * outra começa.
   */
  public cancel(scope: string): void {
    this.turns.get(scope)?.abort();
  }
}
