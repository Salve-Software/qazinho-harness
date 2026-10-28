/**
 * O que o agente que construiu o app respondeu: onde está o .apk ou o .app, o que
 * construiu, ou por que não conseguiu.
 */
export interface IBuildAnswer {
  artifact: string;
  summary: string;
  failure: string;
}
