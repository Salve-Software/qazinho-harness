import { describe, expect, it } from 'vitest';
import { describeUnnamedProject } from '@/context/library';

describe('describeUnnamedProject', () => {
  it('asks for a name in this answer while the project has none', () => {
    const section = describeUnnamedProject(true);

    expect(section.title).toBe("The project's name");
    expect(section.lines.join(' ')).toContain('projectName, in this answer');
  });

  /** O Haiku deixava o nome de fora quando nada dizia o nome do app: uma ideia nunca ganhava um. */
  it('names what is being tested when nothing says the app’s name', () => {
    expect(describeUnnamedProject(true).lines.join(' ')).toContain(
      'When nothing says it, name what is being tested',
    );
    expect(describeUnnamedProject(true).lines.join(' ')).not.toContain(
      'Leave projectName out',
    );
  });

  /** O QAzinho já conta o nome no chat; o Haiku também o dizia na resposta. */
  it('keeps the name out of the reply', () => {
    expect(describeUnnamedProject(true).lines.join(' ')).toContain(
      'leave it out of your reply',
    );
  });

  /** Sem linhas, a seção não vai, e uma sessão que a leu fica sabendo que mudou. */
  it('says nothing once the project has a name', () => {
    expect(describeUnnamedProject(false).lines).toEqual([]);
  });
});
