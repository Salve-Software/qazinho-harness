/**
 * Onde a API do QAzinho responde, o token do job que toda chamada manda, e o fetch com
 * que ela chama.
 */
export interface IRunnerApiProps {
  url: string;
  token: string;
  fetch?: typeof fetch;
}
