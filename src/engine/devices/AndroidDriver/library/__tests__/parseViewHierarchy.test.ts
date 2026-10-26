import { describe, expect, it } from 'vitest';
import { parseViewHierarchy } from '@/engine/devices/AndroidDriver/library';
import { SCREEN_DUMP } from './SCREEN_DUMP';

describe('parseViewHierarchy', () => {
  it('reads every node the device reported', () => {
    expect(parseViewHierarchy(SCREEN_DUMP)).toHaveLength(3);
  });

  it('gives each node the point a finger would land on', () => {
    const [search] = parseViewHierarchy(SCREEN_DUMP);

    expect(search).toMatchObject({ text: 'Search Settings', x: 401, y: 187 });
  });

  it('turns an escaped label back into what a person reads', () => {
    const network = parseViewHierarchy(SCREEN_DUMP).find(({ text }) =>
      text.startsWith('Network'),
    );

    expect(network?.text).toBe('Network & internet');
  });

  it('keeps the short end of the id and of the class, not the whole path', () => {
    const [search] = parseViewHierarchy(SCREEN_DUMP);

    expect(search).toMatchObject({ id: 'search_bar_title', role: 'TextView' });
  });

  it('a node with no box is not somewhere a finger can land', () => {
    const broken =
      '<hierarchy><node text="ghost" bounds="[5,5][5,5]" class="a.b" /></hierarchy>';

    expect(parseViewHierarchy(broken)).toEqual([]);
  });

  it('a dump that is not a dump is an empty screen, not a crash', () => {
    expect(parseViewHierarchy('')).toEqual([]);
  });
});
