/** What an MCP tool call answers the agent: text and pictures, and whether it is an error to act on. */
export type ToolAnswer = {
  content: (
    | { type: 'text'; text: string }
    | { type: 'image'; data: string; mimeType: 'image/jpeg' | 'image/png' }
  )[];
  isError: boolean;
};
