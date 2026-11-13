/**
 * Por que um passo não rodou: o anterior falhou, ficou sem relato, só havia gravações, a
 * IA acabou, o agente precisava do QA, faltou um dado, o caso é à mão ou o QA terminou.
 */
export type UnwalkedReason =
  | 'skipped'
  | 'unreported'
  | 'noAgent'
  | 'capped'
  | 'asked'
  | 'noValue'
  | 'noData'
  | 'manual'
  | 'ended';
