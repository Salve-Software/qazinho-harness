import type { IChangeAnswer } from '@/types';
import { CHANGE_ANSWER } from '@/schemas/CHANGE_ANSWER';

/**
 * A resposta da mudança a partir do que o agente imprimiu, conferida contra o schema;
 * prosa vale como desistência, com a prosa como motivo.
 */
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
