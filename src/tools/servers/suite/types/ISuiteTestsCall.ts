/**
 * Uma chamada para rodar alguns testes da suíte: onde cada um está escrito, a partir da
 * pasta da suíte, e o projeto do Playwright em que rodá-los, '' para todos.
 */
export interface ISuiteTestsCall {
  tests: string[];
  project: string;
}
