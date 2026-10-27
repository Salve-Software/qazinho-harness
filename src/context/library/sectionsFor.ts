import type { CorpusLayer, ICorpusFile, IHarnessSection } from '@/context/types';
import type { IHarnessTarget } from '@/types';

const LAYER_ORDER: readonly CorpusLayer[] = ['universal', 'role', 'platform'];

/**
 * The corpus sections a target reads, from the most stable layer to the least, then by
 * order; a universal file its role is excepted from is left out.
 */
export function sectionsFor(props: {
  corpus: readonly ICorpusFile[];
  target: IHarnessTarget;
}): IHarnessSection[] {
  const { corpus, target } = props;

  return corpus
    .filter(
      (file) =>
        (file.layer === 'universal' && !file.except.includes(target.role)) ||
        (file.layer === 'role' && file.scope === target.role) ||
        (file.layer === 'platform' && file.scope === target.platform),
    )
    .sort(
      (a, b) =>
        LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer) ||
        a.order - b.order ||
        a.path.localeCompare(b.path),
    )
    .map((file) => file.section);
}
