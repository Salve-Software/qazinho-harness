/**
 * Uma dúvida do plano que vai à história: a pergunta, o comentário em que foi, e a
 * resposta quando o time respondeu.
 */
export interface IPlanDoubt {
  id: string;
  question: string;
  sent: { url: string; at: string } | null;
  answer: { text: string; by: string; at: string } | null;
}
