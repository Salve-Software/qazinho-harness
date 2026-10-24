import { parseCorpusFile } from '@/context/library';

export const CORPUS = Object.entries(
  import.meta.glob('@/context/corpus/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
).map(([path, text]) => parseCorpusFile({ path, text }));
