import { describe, expect, it } from 'vitest';
import { decodeXml } from '@/engine/devices/AndroidDriver/library';

describe('decodeXml', () => {
  it('gives back the label a person reads', () => {
    expect(decodeXml('Network &amp; internet')).toBe('Network & internet');
  });

  it('decodes every entity uiautomator writes', () => {
    expect(decodeXml('&lt;a&gt; &quot;b&quot; &apos;c&apos;')).toBe(`<a> "b" 'c'`);
  });

  it('leaves an ampersand that is not an entity alone', () => {
    expect(decodeXml('rock &roll &amp; blues')).toBe('rock &roll & blues');
  });
});
