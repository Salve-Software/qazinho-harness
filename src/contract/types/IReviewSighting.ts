/**
 * Uma vez em que uma run pegou de novo um bug aberto: a run, o passo, o que o agente dela
 * anotou, a tela que deixou e as requisições que falharam em volta.
 */
export interface IReviewSighting {
  runId: string;
  runWhen: string;
  caseId: string;
  stepNumber: number;
  action: string;
  note: string;
  target: string;
  shot: string | null;
  requests: string[];
}
