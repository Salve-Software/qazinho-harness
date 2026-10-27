import type { IAttachSources } from '@/tools/servers/sources/types';
import type { ToolAnswer } from '@/tools/types';
import { readSourceToolCall } from './readSourceToolCall';

/**
 * Carries out one source tool call through whoever fetches it, and answers with what it
 * read or why it could not.
 */
export async function callSourceTool(props: {
  sources: IAttachSources;
  call: { name: string; args: Record<string, unknown> | undefined };
}): Promise<ToolAnswer> {
  const read = readSourceToolCall(props.call);

  if (read.kind === 'refused') return said({ text: read.error, isError: true });

  try {
    return said(await props.sources.fetch(read.call));
  } catch (reason) {
    return said({
      text: `QAzinho could not fetch it: ${reason instanceof Error ? reason.message : String(reason)}`,
      isError: true,
    });
  }
}

function said(props: { text: string; isError: boolean }): ToolAnswer {
  return { content: [{ type: 'text', text: props.text }], isError: props.isError };
}
