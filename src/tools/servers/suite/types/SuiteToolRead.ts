import type { ISuiteTestsCall } from './ISuiteTestsCall';

/**
 * Uma chamada de ferramenta da suíte lida contra o schema: os testes a rodar, ou o que
 * responder ao agente.
 */
export type SuiteToolRead =
  { kind: 'call'; call: ISuiteTestsCall } | { kind: 'refused'; error: string };
