import type { ICorpusFile } from '@/context/types';
import { parse } from 'yaml';

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

/**
 * Lê um `.md` do corpus: onde ele mora diz quem o lê, o frontmatter quais papéis nunca o
 * leem, e o corpo é uma seção `## Título`.
 */
export function parseCorpusFile(props: { path: string; text: string }): ICorpusFile {
  const { path, text } = props;
  const match = FRONTMATTER.exec(text);
  const front = (match ? parse(match[1] ?? '') : null) as {
    order?: unknown;
    except?: unknown;
  } | null;
  const [heading = '', ...body] = (match ? (match[2] ?? '') : text).trim().split('\n');

  if (!heading.startsWith('## '))
    throw new Error(`${path}: a corpus file opens with its "## Title".`);

  return {
    path,
    ...placeOf(path),
    order: typeof front?.order === 'number' ? front.order : 0,
    except: Array.isArray(front?.except)
      ? front.except.filter((role): role is string => typeof role === 'string')
      : [],
    section: {
      title: heading.slice(3).trim(),
      lines: body.join('\n').trim().split('\n'),
    },
  };
}

function placeOf(path: string): Pick<ICorpusFile, 'layer' | 'scope'> {
  const parts = path.slice(path.lastIndexOf('corpus/') + 'corpus/'.length).split('/');
  const [layer, first] = parts;

  if (layer === 'universal' && parts.length === 2) return { layer, scope: null };

  if (layer === 'role' && parts.length === 3 && first !== undefined)
    return { layer, scope: first };

  if (layer === 'platform' && parts.length === 2 && first !== undefined)
    return { layer, scope: first.replace(/\.md$/, '') };

  throw new Error(
    `${path}: a corpus file lives at universal/<x>.md, role/<role>/<x>.md or platform/<platform>.md.`,
  );
}
