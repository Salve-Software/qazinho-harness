/**
 * Por que um passo não rodou: o anterior não se sustentou, ficou sem relato, só havia
 * gravações, a IA acabou, o agente precisava do QA, ou faltou um valor ou um dado.
 */
export type UnwalkedReason =
  'skipped' | 'unreported' | 'noAgent' | 'capped' | 'asked' | 'noValue' | 'noData';
