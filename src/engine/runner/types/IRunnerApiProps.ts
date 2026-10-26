/** Where QAzinho's API answers, the job's token every call sends, and the fetch it calls with. */
export interface IRunnerApiProps {
  url: string;
  token: string;
  fetch?: typeof fetch;
}
