import type { IBuildAnswer } from '@/types';
import { BUILD_ANSWER } from '@/schemas/BUILD_ANSWER';

/** The build answer out of what the agent printed, checked against its schema; prose is read as the reason there is no build. */
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
