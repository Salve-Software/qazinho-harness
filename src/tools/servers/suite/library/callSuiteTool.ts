import type { IAttachSuite } from '@/tools/servers/suite/types';
import type { ToolAnswer } from '@/tools/types';
import { readSuiteToolCall } from './readSuiteToolCall';

function said(props: { text: string; isError: boolean }): ToolAnswer {
  return { content: [{ type: 'text', text: props.text }], isError: props.isError };
}

/** Carries out one suite tool call through whoever runs the tests, and answers with how they went or why they did not run. */
export async function callSuiteTool(props: {
  suite: IAttachSuite;
  call: { name: string; args: Record<string, unknown> | undefined };
}): Promise<ToolAnswer> {
  const read = readSuiteToolCall(props.call);

  if (read.kind === 'refused') return said({ text: read.error, isError: true });

  try {
    return said(await props.suite.runTests(read.call));
  } catch (reason) {
    return said({
      text: `QAzinho could not run them: ${reason instanceof Error ? reason.message : String(reason)}`,
      isError: true,
    });
  }
}
