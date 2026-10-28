/**
 * O que o agente que mudou a suíte de um time respondeu: passando, app errado ou
 * desistiu, e o que escreveu.
 */
export interface IChangeAnswer {
  outcome: 'changed' | 'app-bug' | 'gave-up';
  summary: string;
  commit: string;
  title: string;
  body: string;
}
