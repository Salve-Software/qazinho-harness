import type { IScreenNode } from '@/engine/devices/AndroidDriver/types';
import { boxOfBounds } from './boxOfBounds';
import { centreOf } from './centreOf';
import { decodeXml } from './decodeXml';

const NODE = /<node ([^>]*?)\/?>/g;
const ATTRIBUTE = /([\w-]+)="([^"]*)"/g;

const EDITABLE = ['EditText', 'AutoCompleteTextView', 'SearchView'];

function readAttributes(one: string): Record<string, string> {
  const held: Record<string, string> = {};

  for (const [, name, value] of one.matchAll(ATTRIBUTE)) held[name ?? ''] = value ?? '';

  return held;
}

/** Reads `uiautomator dump`. An attribute value never holds a raw quote, so this stays a scan. */
export function parseViewHierarchy(xml: string): IScreenNode[] {
  return [...xml.matchAll(NODE)].flatMap(([, one]) => {
    const held = readAttributes(one ?? '');
    const at = centreOf(held.bounds ?? '');
    const box = boxOfBounds(held.bounds ?? '');
    const role = (held.class ?? '').split('.').at(-1) ?? '';

    if (!at || !box) return [];

    return [
      {
        text: decodeXml(held.text ?? ''),
        desc: decodeXml(held['content-desc'] ?? ''),
        id: (held['resource-id'] ?? '').split('/').at(-1) ?? '',
        role,
        isClickable: held.clickable === 'true',
        isEditable: EDITABLE.includes(role),
        ...at,
        box,
      },
    ];
  });
}
