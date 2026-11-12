import type { ISkillDraftAnswer } from '@/contract';
import { SKILL_DRAFT } from '@/schemas/SKILL_DRAFT';

/**
 * O que o agente respondeu enquanto escreve uma skill, conferido contra o schema; null
 * quando não é uma resposta. Um nome vira minúsculas ligadas por hífen.
 */
export function readSkillDraft(text: string): ISkillDraftAnswer | null {
  try {
    const read = SKILL_DRAFT.safeParse(JSON.parse(text));

    if (!read.success) return null;

    const { reply, questions, skill } = read.data;
    const name = skill === undefined ? '' : nameOf(skill.name);
    const body = skill?.body.trim() ?? '';

    return {
      reply: reply.trim(),
      questions: (questions ?? []).map(({ multiSelect, ...question }) => ({
        ...question,
        isMultiSelect: multiSelect,
      })),
      skill:
        skill === undefined || name === '' || body === ''
          ? null
          : { name, description: skill.description.trim(), body },
    };
  } catch {
    return null;
  }
}

function nameOf(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
