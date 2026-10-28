import type { SourceCall } from './SourceCall';

/**
 * Uma chamada de ferramenta de fonte lida contra o schema: o que buscar, ou o que
 * responder ao agente.
 */
export type SourceToolRead =
  { kind: 'call'; call: SourceCall } | { kind: 'refused'; error: string };
