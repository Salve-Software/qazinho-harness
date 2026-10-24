import type { IChatAnswer } from '@/contract';
import { CHAT_ANSWER } from '@/schemas';

function jsonOf(text: string): { value: unknown } | null {
  try {
    return { value: JSON.parse(text) };
  } catch {
    return null;
  }
}

function fieldOf(props: { value: unknown; key: string }): unknown {
  return typeof props.value === 'object' && props.value !== null
    ? (props.value as Record<string, unknown>)[props.key]
    : undefined;
}

function withoutNullVariables(questions: unknown): unknown {
  if (!Array.isArray(questions)) return questions;

  return questions.map((question: unknown) => {
    const options = fieldOf({ value: question, key: 'options' });

    return Array.isArray(options)
      ? {
          ...(question as Record<string, unknown>),
          options: options.map((option: unknown) =>
            fieldOf({ value: option, key: 'variables' }) === null
              ? { ...(option as Record<string, unknown>), variables: undefined }
              : option,
          ),
        }
      : question;
  });
}

function withoutNullIds(plan: unknown): unknown {
  const cases = fieldOf({ value: plan, key: 'cases' });

  if (!Array.isArray(cases)) return plan;

  return {
    ...(plan as Record<string, unknown>),
    cases: cases.map((one: unknown) => {
      const steps = fieldOf({ value: one, key: 'steps' });

      return {
        ...(one as Record<string, unknown>),
        ...(fieldOf({ value: one, key: 'id' }) === null ? { id: undefined } : {}),
        ...(Array.isArray(steps)
          ? {
              steps: steps.map((step: unknown) =>
                fieldOf({ value: step, key: 'frame' }) === null
                  ? { ...(step as Record<string, unknown>), frame: undefined }
                  : step,
              ),
            }
          : {}),
      };
    }),
  };
}

/** Checks a chat answer against its schema; prose is still a reply, and a part that breaks the schema costs only itself. */
export function readChatAnswer(text: string): IChatAnswer | null {
  const json = jsonOf(text);

  if (json === null) {
    const prose = text.trim();

    return prose.length === 0 ? null : { reply: prose, questions: [], plan: null };
  }

  const field = (key: string) => fieldOf({ value: json.value, key });
  const reply = CHAT_ANSWER.shape.reply.safeParse(field('reply')).data;

  if (reply === undefined) return null;

  const questions =
    CHAT_ANSWER.shape.questions.safeParse(withoutNullVariables(field('questions')))
      .data ?? [];

  return {
    reply: reply.trim(),
    questions: questions.map(({ multiSelect, options, ...question }) => ({
      ...question,
      options: options.map(({ variables, ...option }) =>
        variables === undefined || variables.length === 0
          ? option
          : { ...option, variables },
      ),
      isMultiSelect: multiSelect,
    })),
    plan: CHAT_ANSWER.shape.plan.safeParse(withoutNullIds(field('plan'))).data ?? null,
  };
}
