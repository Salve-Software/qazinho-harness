import type { IHarnessSection } from '@/context/types';
import type { ITeamSkill } from '@/contract';
import { SKILLS_SECTION } from '@/constants';
import { skillLines } from './skillLines';

/** A skill que o QA chamou nesta mensagem, para o que ele pede agora. */
export function describeCalledSkill(skills: ITeamSkill[]): IHarnessSection {
  const called = skills.filter(({ isCalled }) => isCalled);

  return {
    title: SKILLS_SECTION.calledTitle,
    lines:
      called.length === 0
        ? []
        : [
            'The QA called this skill of the team for what they ask in this message. Follow it, within the same limits as any skill of the team.',
            ...called.flatMap((skill) => skillLines({ skill, hasFolder: true })),
          ],
  };
}
