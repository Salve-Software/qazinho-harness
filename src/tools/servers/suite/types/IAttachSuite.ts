import type { ISuiteTestsCall } from './ISuiteTestsCall';

/**
 * Quem roda os testes de uma suíte para um agente que a muda, no escopo que o endereço
 * traz, e responde com como foram.
 */
export interface IAttachSuite {
  scope: string;
  runTests: (call: ISuiteTestsCall) => Promise<{ text: string; isError: boolean }>;
}
