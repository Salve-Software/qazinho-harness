/**
 * Quem o agente é numa chamada: chat, runner, explorer, assistant, builder, reporter,
 * reader, keeper, watcher ou o que escreve uma skill com o QA.
 */
export type HarnessRole =
  | 'chat'
  | 'runner'
  | 'explorer'
  | 'assistant'
  | 'builder'
  | 'reporter'
  | 'reader'
  | 'keeper'
  | 'watcher'
  | 'skill-writer';
