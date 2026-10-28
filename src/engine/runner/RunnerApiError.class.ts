/**
 * Uma chamada que a API recusou: o status e o código com que respondeu, que um runner lê
 * para parar quando o job acabou.
 */
export class RunnerApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  public constructor(props: { status: number; code: string; path: string }) {
    super(`The API answered ${String(props.status)} (${props.code}) to ${props.path}.`);
    this.status = props.status;
    this.code = props.code;
  }
}
