import type { CorpusLayer } from './CorpusLayer';
import type { IHarnessSection } from './IHarnessSection';

/**
 * Um `.md` do corpus: a camada e o escopo vêm do caminho, a ordem e os papéis que nunca o
 * leem vêm do frontmatter.
 */
export interface ICorpusFile {
  path: string;
  layer: CorpusLayer;
  scope: string | null;
  order: number;
  except: string[];
  section: IHarnessSection;
}
