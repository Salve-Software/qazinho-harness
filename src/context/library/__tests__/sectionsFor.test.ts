import type { ICorpusFile } from '@/context/types';
import { describe, expect, it } from 'vitest';
import { sectionsFor } from '@/context/library';

function file(
  props: Omit<ICorpusFile, 'section' | 'except'> & { title: string; except?: string[] },
): ICorpusFile {
  return { except: [], ...props, section: { title: props.title, lines: [] } };
}

const CORPUS = [
  file({ path: 'p/web', layer: 'platform', scope: 'web', order: 0, title: 'web' }),
  file({ path: 'r/runner', layer: 'role', scope: 'runner', order: 0, title: 'runner' }),
  file({ path: 'u/b', layer: 'universal', scope: null, order: 20, title: 'second' }),
  file({ path: 'r/chat', layer: 'role', scope: 'chat', order: 0, title: 'chat' }),
  file({ path: 'u/a', layer: 'universal', scope: null, order: 10, title: 'first' }),
  file({ path: 'p/ios', layer: 'platform', scope: 'ios', order: 0, title: 'ios' }),
  file({
    path: 'u/c',
    layer: 'universal',
    scope: null,
    order: 30,
    title: 'third',
    except: ['reader'],
  }),
];

const titles = (target: Parameters<typeof sectionsFor>[0]['target']) =>
  sectionsFor({ corpus: CORPUS, target }).map(({ title }) => title);

describe('sectionsFor', () => {
  it('goes from the most stable layer to the least, and by order inside one', () => {
    expect(titles({ role: 'runner', platform: 'web' })).toEqual([
      'first',
      'second',
      'third',
      'runner',
      'web',
    ]);
  });

  it('does NOT hand one role the other role, nor another platform', () => {
    expect(titles({ role: 'chat' })).toEqual(['first', 'second', 'third', 'chat']);
  });

  it('gives no platform section to a target with no device', () => {
    expect(titles({ role: 'runner' })).toEqual(['first', 'second', 'third', 'runner']);
  });

  it('leaves out a universal file its role is excepted from', () => {
    expect(titles({ role: 'reader' })).toEqual(['first', 'second']);
  });
});
