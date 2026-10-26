import { describe, expect, it } from 'vitest';
import { findNode, parseViewHierarchy } from '@/engine/devices/AndroidDriver/library';
import { SCREEN_DUMP } from './SCREEN_DUMP';

const NODES = parseViewHierarchy(SCREEN_DUMP);

describe('findNode', () => {
  it('finds what the agent named, the way a person reads it', () => {
    expect(findNode({ nodes: NODES, target: 'Connected devices' })?.text).toBe(
      'Connected devices',
    );
  });

  it('takes the second of several that read alike when the agent says #2', () => {
    const node = NODES[0];

    if (!node) throw new Error('the dump has no node');

    const rows = [
      { ...node, text: 'Buy', id: 'first' },
      { ...node, text: 'Buy', id: 'second' },
    ];

    expect(findNode({ nodes: rows, target: 'Buy #2' })?.id).toBe('second');
    expect(findNode({ nodes: rows, target: 'Buy #3' })).toBeNull();
  });

  it('finds a control the agent copied the way look lists it', () => {
    expect(findNode({ nodes: NODES, target: 'textview: Connected devices' })?.text).toBe(
      'Connected devices',
    );
  });

  it('does not care about case', () => {
    expect(findNode({ nodes: NODES, target: 'search settings' })?.id).toBe(
      'search_bar_title',
    );
  });

  it('takes part of a label, because the agent shortens what it saw', () => {
    expect(findNode({ nodes: NODES, target: 'Connected' })?.text).toBe(
      'Connected devices',
    );
  });

  it('prefers the whole label over one that merely contains it', () => {
    const nodes = [
      { ...NODES[0]!, text: 'Network & internet settings' },
      { ...NODES[0]!, text: 'Network' },
    ];

    expect(findNode({ nodes, target: 'Network' })?.text).toBe('Network');
  });

  it('falls back to the id when nothing reads that way', () => {
    expect(findNode({ nodes: NODES, target: 'search_bar_title' })?.text).toBe(
      'Search Settings',
    );
  });

  it('nothing on the screen answering is null, not the first node', () => {
    expect(findNode({ nodes: NODES, target: 'Bluetooth' })).toBeNull();
  });

  it('a blank target never matches', () => {
    expect(findNode({ nodes: NODES, target: '  ' })).toBeNull();
  });

  /** A screen titled "Entrar" with an "Entrar" button: the tap belongs on the button. */
  it('taps the control before the text that reads the same', () => {
    const node = NODES[0];

    if (!node) throw new Error('the dump has no node');

    const nodes = [
      { ...node, text: 'Entrar', id: 'title', isClickable: false, isEditable: false },
      { ...node, text: 'Entrar', id: 'submit', isClickable: true },
    ];

    expect(findNode({ nodes, target: 'Entrar' })?.id).toBe('submit');
  });

  it('counts "#2" among the controls look listed, not the text around them', () => {
    const node = NODES[0];

    if (!node) throw new Error('the dump has no node');

    const nodes = [
      { ...node, text: 'Entrar', id: 'title', isClickable: false, isEditable: false },
      { ...node, text: 'Entrar', id: 'menu', isClickable: true },
      { ...node, text: 'Entrar', id: 'submit', isClickable: true },
    ];

    expect(findNode({ nodes, target: 'Entrar #2' })?.id).toBe('submit');
  });
});
