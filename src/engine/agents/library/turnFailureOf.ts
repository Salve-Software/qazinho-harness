import Anthropic from '@anthropic-ai/sdk';

/** Why a turn could not go on, in words a run keeps: what the model's endpoint answered, or what broke on the way. */
export function turnFailureOf(reason: unknown): string {
  if (reason instanceof Anthropic.APIError)
    return reason.status === undefined
      ? `The model could not be reached: ${reason.message}`
      : `The model answered ${String(reason.status)}: ${reason.message}`;

  return `The agent broke off: ${reason instanceof Error ? reason.message : String(reason)}`;
}
