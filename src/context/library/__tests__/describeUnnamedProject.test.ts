import { describe, expect, it } from 'vitest';
import { describeUnnamedProject } from '@/context/library';

describe('describeUnnamedProject', () => {
  it('asks for the app’s name while the project has none', () => {
    const section = describeUnnamedProject(true);

    expect(section.title).toBe("The project's name");
    expect(section.lines.join(' ')).toContain('projectName');
  });

  /** Sem linhas, a seção não vai, e uma sessão que a leu fica sabendo que mudou. */
  it('says nothing once the project has a name', () => {
    expect(describeUnnamedProject(false).lines).toEqual([]);
  });
});
