import type { IModelClient } from '@/engine/agents/types';
import type { ICaseTurn } from '@/engine/walk/types';
import type { IDevicePort, IStepReport } from '@/tools/servers/device/types';
import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { GATEWAY_AGENT, GatewayAgent } from '@/engine/agents';

/** Uma mensagem do modelo com os blocos que o teste dá, como a Messages API responde. */
function messageOf(
  content: Anthropic.ContentBlock[],
  stop: Anthropic.StopReason = 'tool_use',
): Anthropic.Message {
  return {
    id: 'msg',
    type: 'message',
    role: 'assistant',
    model: 'claude-haiku-5-5',
    content,
    stop_reason: stop,
  } as Anthropic.Message;
}

const use = (call: { id: string; name: string; input: Record<string, unknown> }) =>
  ({ type: 'tool_use', ...call }) as Anthropic.ToolUseBlock;

const said = (text: string) => ({ type: 'text', text }) as Anthropic.TextBlock;

/**
 * Um cliente que responde cada chamada com a próxima mensagem do roteiro do teste, ou o
 * erro que ele guarda, e guarda cada requisição.
 */
function fakeClient(script: (Anthropic.Message | Error)[]) {
  const asked: Anthropic.MessageCreateParamsNonStreaming[] = [];
  const signals: AbortSignal[] = [];
  const client: IModelClient = {
    create: ({ body, signal }) => {
      asked.push(structuredClone(body));
      signals.push(signal);

      const next = script.shift() ?? messageOf([said('Done.')], 'end_turn');

      return next instanceof Error ? Promise.reject(next) : Promise.resolve(next);
    },
  };

  return { client, asked, signals };
}

/** Um dispositivo que mostra um carrinho e guarda cada ação e relato. */
function turnOn(overrides: Partial<ICaseTurn> = {}) {
  const acted: string[] = [];
  const reports: IStepReport[] = [];
  const driver: IDevicePort = {
    describe: () => Promise.resolve('Cart: 2 items'),
    inspect: () => Promise.resolve(''),
    failedCalls: () => Promise.resolve([]),
    calls: () => Promise.resolve(''),
    glance: () => Promise.resolve({ data: 'AAAA', mimeType: 'image/jpeg' }),
    act: (action) => {
      acted.push(`${action.kind} ${action.target}`);

      return Promise.resolve();
    },
  };
  const turn: ICaseTurn = {
    scope: 'plan-1',
    systemPrompt: 'You walk a case.',
    prompt: 'Step 1: open the cart.',
    allowedTools: [],
    device: {
      workspaceId: 'plan-1',
      driver,
      onReport: (report) => {
        reports.push(report);

        return Promise.resolve('Filed. That was the last step of this case.');
      },
    },
    ...overrides,
  };

  return { turn, acted, reports };
}

describe('GatewayAgent', () => {
  it('carries out each tool call on the device and answers it with the screen, until the model ends its turn', async () => {
    const { client, asked } = fakeClient([
      messageOf([
        said('Opening it.'),
        use({ id: 't1', name: 'click', input: { target: 'Cart' } }),
      ]),
      messageOf([
        use({
          id: 't2',
          name: 'report',
          input: {
            step: 1,
            verdict: 'passed',
            why: 'The cart shows 2 items',
            got: 'Cart: 2 items',
            proof: 'Cart: 2 items',
          },
        }),
      ]),
      messageOf([said('The case is done.')], 'end_turn'),
    ]);
    const { turn, acted, reports } = turnOn();

    const ended = await new GatewayAgent({ client, model: 'claude-haiku-5-5' }).walk(
      turn,
    );

    expect(ended).toEqual({ kind: 'ended', costUsd: null });
    expect(acted).toEqual(['click Cart']);
    expect(reports).toMatchObject([
      { step: 1, verdict: 'passed', proof: 'Cart: 2 items' },
    ]);
    expect(asked).toHaveLength(3);
    expect(asked[1]?.messages.at(-1)).toEqual({
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: 't1',
          content: [
            { type: 'text', text: expect.stringContaining('Cart: 2 items') as unknown },
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: 'AAAA' },
            },
          ],
          is_error: false,
        },
      ],
    });
  });

  it('asks with the run’s system prompt, the walk’s device tools and the model, caching the prefix', async () => {
    const { client, asked } = fakeClient([
      messageOf([said('Nothing to do.')], 'end_turn'),
    ]);

    await new GatewayAgent({ client, model: 'claude-haiku-5-5' }).walk(turnOn().turn);

    expect(asked[0]).toMatchObject({
      model: 'claude-haiku-5-5',
      max_tokens: GATEWAY_AGENT.maxTokens,
      cache_control: { type: 'ephemeral' },
      system: 'You walk a case.',
      messages: [{ role: 'user', content: 'Step 1: open the cart.' }],
    });
    const names = (asked[0]?.tools ?? []).map((tool) =>
      'name' in tool ? tool.name : '',
    );

    expect(names).toContain('report');
    expect(names).not.toContain('finish');
  });

  it('answers a call the tools refuse as an error the model can act on', async () => {
    const { client, asked } = fakeClient([
      messageOf([use({ id: 't1', name: 'click', input: {} })]),
      messageOf([said('Giving up.')], 'end_turn'),
    ]);

    await new GatewayAgent({ client, model: 'claude-haiku-5-5' }).walk(turnOn().turn);

    expect(asked[1]?.messages.at(-1)).toMatchObject({
      content: [{ type: 'tool_result', tool_use_id: 't1', is_error: true }],
    });
  });

  it('says the run spent all it may when the gateway answers 402', async () => {
    const { client } = fakeClient([
      Anthropic.APIError.generate(
        402,
        { error: { type: 'credit_cap_reached' } },
        'credit_cap_reached',
        new Headers(),
      ),
    ]);

    expect(
      await new GatewayAgent({ client, model: 'claude-haiku-5-5' }).walk(turnOn().turn),
    ).toEqual({ kind: 'capped', costUsd: null });
  });

  it('breaks off with what the model answered when a call fails otherwise', async () => {
    const { client } = fakeClient([
      Anthropic.APIError.generate(
        401,
        { error: { type: 'authentication_error' } },
        'job_token_refused',
        new Headers(),
      ),
    ]);

    expect(
      await new GatewayAgent({ client, model: 'claude-haiku-5-5' }).walk(turnOn().turn),
    ).toEqual({
      kind: 'failed',
      reason: expect.stringContaining('The model answered 401') as unknown,
      costUsd: null,
    });
  });

  it('ends a turn quietly once it is cancelled, aborting the call in flight', async () => {
    const agent = new GatewayAgent({
      client: {
        create: ({ signal }) =>
          new Promise((_, reject) => {
            signal.addEventListener('abort', () => {
              reject(new Anthropic.APIUserAbortError());
            });
          }),
      },
      model: 'claude-haiku-5-5',
    });
    const walking = agent.walk(turnOn().turn);

    agent.cancel('plan-1');

    expect(await walking).toEqual({ kind: 'ended', costUsd: null });
  });

  it('ends a turn whose model refused to go on, rather than breaking the run', async () => {
    const { client } = fakeClient([
      messageOf([use({ id: 't1', name: 'look', input: {} })], 'refusal'),
    ]);

    expect(
      await new GatewayAgent({ client, model: 'claude-haiku-5-5' }).walk(turnOn().turn),
    ).toEqual({ kind: 'ended', costUsd: null });
  });
});
