import type { IHarnessSection } from '@/context/types';

/**
 * Quem escreveu a mensagem quando não foi o QA: o agente de código dele, pelo servidor
 * MCP do QAzinho.
 */
export function describeSender(isFromAgent: boolean): IHarnessSection {
  return {
    title: 'Who wrote this message',
    lines: isFromAgent
      ? [
          "The coding agent the QA works with in their editor wrote this message, through QAzinho's MCP server; the QA did not type it. It works for the QA, often on the app's code, and reads your answer as text.",
          "Answer it as you would the QA, plainly enough for it to act on. A choice only the QA can make, such as what the app should do, still goes to the QA in your questions; the agent may answer them in the QA's place, and the QA sees it all in this chat.",
        ]
      : [],
  };
}
