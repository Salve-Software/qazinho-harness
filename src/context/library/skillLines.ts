import type { ITeamSkill } from '@/contract';
import { SKILLS_SECTION } from '@/constants';

/**
 * Uma skill como o agente a lê: o nome, quando usar, a pasta dela quando ele pode ler, e
 * as instruções, recuadas para não abrir uma seção nem fechar o <qazinho>.
 */
export function skillLines(props: { skill: ITeamSkill; hasFolder: boolean }): string[] {
  const { skill } = props;
  const body = skill.body.trim();
  const kept =
    body.length > SKILLS_SECTION.bodyChars
      ? `${body.slice(0, SKILLS_SECTION.bodyChars)}\n(the rest is cut)`
      : body;

  return [
    '',
    `Skill "${skill.name}": ${skill.description}`,
    ...(props.hasFolder
      ? [`Its files are in ${skill.dir}; read one with Read when the skill names it.`]
      : []),
    ...kept
      .replace(/<\/?qazinho>/gi, '[qazinho]')
      .split('\n')
      .map((line) => `  ${line}`),
  ];
}
