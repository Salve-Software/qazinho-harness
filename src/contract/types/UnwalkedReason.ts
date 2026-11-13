/**
 * Por que um passo não rodou: o anterior não se sustentou, ficou sem relato, só havia
 * gravações, a IA acabou, o agente precisava do QA, faltou um dado, ou o caso é à mão.
 */
export type UnwalkedReason =
  | 'skipped'
  | 'unreported'
  | 'noAgent'
  | 'capped'
  | 'asked'
  | 'noValue'
  | 'noData'
  | 'manual';
