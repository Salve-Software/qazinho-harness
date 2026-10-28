/**
 * Uma vez em que um bug foi pego, como um runner a manda: a run pelo próprio id e quando
 * começou, o passo, a chave da tela e o momento em segundos no vídeo.
 */
export interface ISightingBody {
  runId: string;
  runWhen: string;
  caseId: string;
  stepNumber: number;
  shot: string | null;
  at: number | null;
}
