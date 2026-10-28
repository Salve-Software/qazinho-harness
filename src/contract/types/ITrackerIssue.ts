/**
 * Uma issue como o tracker a mantém agora, para o agente ler antes de acrescentar a ela:
 * o que ela diz, se o time a fechou, e o que o time disse embaixo.
 */
export interface ITrackerIssue {
  key: string;
  title: string;
  url: string;
  status: string;
  isClosed: boolean;
  body: string;
  comments: { author: string; at: string; text: string }[];
}
