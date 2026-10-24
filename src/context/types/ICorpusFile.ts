import type { CorpusLayer } from './CorpusLayer';
import type { IHarnessSection } from './IHarnessSection';

/** One `.md` of the corpus: its layer and scope come from its path, its order from its frontmatter. */
export interface ICorpusFile {
  path: string;
  layer: CorpusLayer;
  scope: string | null;
  order: number;
  section: IHarnessSection;
}
