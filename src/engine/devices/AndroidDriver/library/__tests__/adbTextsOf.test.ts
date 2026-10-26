import { describe, expect, it } from 'vitest';
import { adbTextsOf } from '@/engine/devices/AndroidDriver/library';

describe('adbTextsOf', () => {
  it('types a plain text in one go, each space as the %s input text reads as one', () => {
    expect(adbTextsOf('Ana Souza')).toEqual(['Ana%sSouza']);
  });

  /** A password went through the phone's shell as typed: $& and (x) never reached the field. */
  it("escapes every character the phone's shell would read instead of typing", () => {
    expect(adbTextsOf("P@ss $& (x) 'a' ;b|c<d>e*f?g[h]{i}~#!\\`")).toEqual([
      "P@ss%s\\$\\&%s\\(x\\)%s\\'a\\'%s\\;b\\|c\\<d\\>e\\*f\\?g\\[h\\]\\{i\\}\\~\\#\\!\\\\\\`",
    ]);
  });

  it('splits around a %s the value holds, so it is typed as written and not as a space', () => {
    expect(adbTextsOf('a%sb c%s')).toEqual(['a%', 'sb%sc%', 's']);
  });

  it('leaves letters, digits and ordinary marks alone', () => {
    expect(adbTextsOf('qa+1@shop.test:8080/a-b_c=d,e.')).toEqual([
      'qa+1@shop.test:8080/a-b_c=d,e.',
    ]);
  });

  it('types nothing for an empty text', () => {
    expect(adbTextsOf('')).toEqual([]);
  });
});
