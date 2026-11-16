import type { OutsideCaller } from '@/contract';
import type { OutsidePerform } from '@/tools/servers/outside/types';
import type { ToolAnswer } from '@/tools/types';
import { readOutsideToolCall } from './readOutsideToolCall';

/**
 * Executa a chamada de um agente de fora pelo app, e responde com o que foi feito ou por
 * que não foi.
 */
export async function callOutsideTool(props: {
  perform: OutsidePerform;
  call: { name: string; args: Record<string, unknown> | undefined };
  caller: OutsideCaller;
}): Promise<ToolAnswer> {
  const read = readOutsideToolCall(props.call);

  if (read.kind === 'refused') return said({ text: read.error, isError: true });

  try {
    return said(await props.perform(read.call, props.caller));
  } catch (reason) {
    return said({
      text: `QAzinho could not do it: ${reason instanceof Error ? reason.message : String(reason)}`,
      isError: true,
    });
  }
}

function said(props: { text: string; isError: boolean }): ToolAnswer {
  return { content: [{ type: 'text', text: props.text }], isError: props.isError };
}
