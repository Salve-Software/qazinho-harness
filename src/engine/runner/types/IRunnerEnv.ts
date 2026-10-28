/**
 * Com o que a máquina de uma run do CI começa: onde a API responde, o job e o token, onde
 * ela trabalha, e onde estão as ferramentas do dispositivo, quando a máquina diz.
 */
export interface IRunnerEnv {
  apiUrl: string;
  jobId: string;
  token: string;
  workDir: string;
  androidSdk: string | null;
  avd: string | null;
  simulator: string | null;
  idb: string | null;
}
