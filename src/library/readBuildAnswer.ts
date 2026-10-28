import type { IBuildAnswer } from '@/types';
import { BUILD_ANSWER } from '@/schemas/BUILD_ANSWER';

/**
 * A resposta do build a partir do que o agente imprimiu, conferida contra o schema; prosa
 * é lida como o motivo de não haver build.
 */
export function readBuildAnswer(text: string): IBuildAnswer {
  try {
    const read = BUILD_ANSWER.safeParse(JSON.parse(text));

    if (read.success)
      return {
        artifact: read.data.artifact.trim(),
        summary: read.data.summary.trim(),
        failure: read.data.failure.trim(),
      };
  } catch {
    return { artifact: '', summary: '', failure: text.trim() };
  }

  return { artifact: '', summary: '', failure: text.trim() };
}
