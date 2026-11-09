/** O texto de uma memória numa linha só, sem poder abrir uma seção nem fechar o bloco. */
export function memoryLineOf(text: string): string {
  return text
    .replace(/<\/?qazinho>/gi, '[qazinho]')
    .replace(/\s+/g, ' ')
    .trim();
}
