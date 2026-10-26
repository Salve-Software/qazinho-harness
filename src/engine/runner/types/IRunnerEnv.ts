/** What a CI run's machine starts with: where the API answers, its job and token, where it works, and where its device tools are, when the machine says. */
export interface IRunnerEnv {
  apiUrl: string;
  jobId: string;
  token: string;
  workDir: string;
  androidSdk: string | null;
  avd: string | null;
  simulator: string | null;
}
