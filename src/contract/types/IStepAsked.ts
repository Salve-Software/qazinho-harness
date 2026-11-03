/**
 * O que um passo perguntou numa run em que ninguém responde: a pergunta, as respostas que
 * ela oferece, o que a tela mostrava, e a variável quando a resposta é um segredo.
 */
export interface IStepAsked {
  question: string;
  options: string[];
  screen: string | null;
  secret: string | null;
}
