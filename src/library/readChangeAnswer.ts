import type { IChangeAnswer } from '@/types';
import { CHANGE_ANSWER } from '@/schemas/CHANGE_ANSWER';

/** The change answer out of what the agent printed, checked against its schema; prose reads as giving up, with the prose as why. */
export function readChangeAnswer(text: string): IChangeAnswer {
  const gaveUp: IChangeAnswer = {
    outcome: 'gave-up',
    summary: text.trim(),
    commit: '',
    title: '',
    body: '',
  };

  try {
    const read = CHANGE_ANSWER.safeParse(JSON.parse(text));

    return read.success
      ? {
          outcome: read.data.outcome,
          summary: read.data.summary.trim(),
          commit: read.data.commit.trim(),
          title: read.data.title.trim(),
          body: read.data.body.trim(),
        }
      : gaveUp;
  } catch {
    return gaveUp;
  }
}
