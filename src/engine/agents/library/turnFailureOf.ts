import Anthropic from '@anthropic-ai/sdk';

/**
 * Por que um turno não pôde seguir, em palavras que uma run guarda: o que o endpoint do
 * modelo respondeu, ou o que quebrou no caminho.
 */
export function turnFailureOf(reason: unknown): string {
  if (reason instanceof Anthropic.APIError)
    return reason.status === undefined
      ? `The model could not be reached: ${reason.message}`
      : `The model answered ${String(reason.status)}: ${reason.message}`;

  return `The agent broke off: ${reason instanceof Error ? reason.message : String(reason)}`;
}
