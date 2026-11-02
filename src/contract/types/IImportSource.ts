import type { IImportFramework } from './IImportFramework';

/**
 * Uma pasta de testes que o QA importa: onde ela está, o que o QAzinho reconheceu nela e,
 * se for um repositório git, a branch e o commit.
 */
export interface IImportSource {
  name: string;
  dir: string;
  frameworks: IImportFramework[];
  files: string[];
  branch: string | null;
  commit: string | null;
}
