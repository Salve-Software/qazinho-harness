import type { IAttachApp } from '@/tools/servers/app/types';
import type { ToolAnswer } from '@/tools/types';
import { readAppToolCall } from './readAppToolCall';

function said(props: { text: string; isError: boolean }): ToolAnswer {
  return { content: [{ type: 'text', text: props.text }], isError: props.isError };
}

/** Carries out one app tool call through whoever performs them, and answers with what was done or why it was not. */
export async function callAppTool(props: {
  app: IAttachApp;
  call: { name: string; args: Record<string, unknown> | undefined };
}): Promise<ToolAnswer> {
  const read = readAppToolCall(props.call);

  if (read.kind === 'refused') return said({ text: read.error, isError: true });

  try {
    return said(await props.app.perform(read.call));
  } catch (reason) {
    return said({
      text: `QAzinho could not do it: ${reason instanceof Error ? reason.message : String(reason)}`,
      isError: true,
    });
  }
}
