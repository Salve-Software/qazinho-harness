import type { IChangeBrief, IChangeRead, IDraftedCase } from '@/contract';
import { CHANGE_READ } from '@/schemas/CHANGE_READ';

/**
 * A leitura de uma mudança, conferida contra os casos e as dúvidas que o leitor recebeu:
 * o que nomeia um caso ou uma dúvida fora deles sai; null quando não é uma leitura.
 */
export function readChangeRead(props: {
  text: string;
  brief: IChangeBrief;
}): IChangeRead | null {
  try {
    const read = CHANGE_READ.safeParse(withSources(withoutNulls(JSON.parse(props.text))));

    if (!read.success) return null;

    const ids = new Set(props.brief.cases.map(({ id }) => id));
    const open = new Set(
      props.brief.doubts.filter(({ answer }) => answer === null).map(({ id }) => id),
    );

    return {
      summary: read.data.summary.trim(),
      changes: read.data.changes
        .filter(({ caseId }) => ids.has(caseId))
        .map((one) => ({
          caseId: one.caseId,
          why: one.why.trim(),
          case: caseOf({ ...one.case, id: one.caseId }),
        })),
      added: read.data.added.map((one) => ({
        why: one.why.trim(),
        case: caseOf({ ...one.case, id: undefined }),
      })),
      doubts: read.data.doubts.map((doubt) => doubt.trim()),
      answered: read.data.answered
        .filter(({ doubtId }) => open.has(doubtId))
        .map((one) => ({ doubtId: one.doubtId, text: one.text.trim() })),
    };
  } catch {
    return null;
  }
}

function caseOf(drafted: IDraftedCase): IDraftedCase {
  return {
    ...drafted,
    title: drafted.title.trim(),
    steps: drafted.steps.map((step) => ({
      ...step,
      action: step.action.trim(),
      expected: step.expected.trim(),
    })),
  };
}

function withoutNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutNulls);

  if (typeof value !== 'object' || value === null) return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, field]) =>
      field === null ? [] : [[key, withoutNulls(field)]],
    ),
  );
}

function withSources(read: unknown): unknown {
  if (typeof read !== 'object' || read === null) return read;

  const listed = (items: unknown) =>
    Array.isArray(items)
      ? items.map((item: unknown) => {
          const one = (item ?? {}) as { case?: { sources?: unknown } };

          return typeof one.case === 'object' && !Array.isArray(one.case.sources)
            ? { ...one, case: { ...one.case, sources: [] } }
            : item;
        })
      : items;
  const { changes, added } = read as { changes?: unknown; added?: unknown };

  return { ...read, changes: listed(changes), added: listed(added) };
}
