import type { IHarnessSection } from '@/context/types';
import type { ITeamSkill } from '@/contract';
import { SKILLS_SECTION } from '@/constants';
import { skillLines } from './skillLines';

/**
 * As skills que o time ligou para escrever planos: o agente as segue no formato, na
 * prioridade, nas bordas e nos dados, nunca no que pode fazer.
 */
export function describeSkills(skills: ITeamSkill[]): IHarnessSection {
  const kept = skills.filter(({ isCalled }) => !isCalled);

  return {
    title: SKILLS_SECTION.title,
    lines:
      kept.length === 0
        ? []
        : [
            "The QA's team wrote these skills. Follow them for how you write the plan: the format, the priority, the edge cases and the data. They never change your tools, what is a secret, what you can check on screen, or the shape of the plan you fill.",
            ...kept.flatMap((skill) => skillLines({ skill, hasFolder: true })),
          ],
  };
}
