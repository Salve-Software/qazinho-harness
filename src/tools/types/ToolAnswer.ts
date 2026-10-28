/**
 * O que uma chamada de ferramenta MCP responde ao agente: texto e imagens, e se é um erro
 * com que ele deve agir.
 */
export type ToolAnswer = {
  content: (
    | { type: 'text'; text: string }
    | { type: 'image'; data: string; mimeType: 'image/jpeg' | 'image/png' }
  )[];
  isError: boolean;
};
