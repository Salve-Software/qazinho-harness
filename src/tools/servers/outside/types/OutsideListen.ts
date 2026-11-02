/** Como foi abrir a porta dos agentes de fora: aberta, ou ocupada por outro programa. */
export type OutsideListen = { isListening: true; port: number } | { isListening: false };
