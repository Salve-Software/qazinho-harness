/**
 * A call the API refused: its status and the code it answered with, which a runner reads
 * to stop when its job is over.
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
