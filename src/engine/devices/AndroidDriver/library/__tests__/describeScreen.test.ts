import { describe, expect, it } from 'vitest';
import { ANDROID } from '@/engine/devices/AndroidDriver/constants';
import {
  describeScreen,
  parseViewHierarchy,
} from '@/engine/devices/AndroidDriver/library';
import { SCREEN_DUMP } from './SCREEN_DUMP';

const NODES = parseViewHierarchy(SCREEN_DUMP);

describe('describeScreen', () => {
  it('says which app is in front and what it reads', () => {
    const said = describeScreen({ nodes: NODES, app: 'com.android.settings' });

    expect(said).toContain('APP: com.android.settings');
    expect(said).toContain('Network & internet');
  });

  it('a screen longer than the limit is cut, so one screen never eats the context', () => {
    const many = Array.from({ length: 400 }, (_one, index) => ({
      ...NODES[0]!,
      text: `row number ${String(index)}`,
    }));

    const said = describeScreen({ nodes: many, app: 'com.example' });

    expect(said.length).toBeLessThan(ANDROID.screenTextLimit + ANDROID.labelLimit * 50);
  });

  it('an empty screen is still described, so the agent knows it is empty', () => {
    expect(describeScreen({ nodes: [], app: 'com.example' })).toBe(
      'APP: com.example\nTEXT:\n\nCONTROLS:',
    );
  });
});
