/**
 * Algo que pode mudar o que o agente guarda: o que o QA disse, a resposta dele a uma
 * pergunta, ou o que o agente disse enquanto andava pelo app.
 */
export type KeepEvent =
  | { kind: 'said'; text: string }
  | { kind: 'answered'; question: string; answer: string }
  | { kind: 'walked'; text: string };
