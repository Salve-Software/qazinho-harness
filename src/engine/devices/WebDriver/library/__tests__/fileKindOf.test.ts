import { describe, expect, it } from 'vitest';
import { fileKindOf } from '@/engine/devices/WebDriver/library';

const kindOf = (bytes: Buffer, name = 'arquivo') => fileKindOf({ name, bytes });

describe('fileKindOf', () => {
  it('knows a PDF by its mark, even after some junk at the start', () => {
    expect(kindOf(Buffer.from('%PDF-1.7 ...'))).toBe('pdf');
    expect(kindOf(Buffer.from('\n\n%PDF-1.4 ...'))).toBe('pdf');
  });

  it('knows pictures by their first bytes, not by the name', () => {
    expect(kindOf(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0]))).toBe('image');
    expect(kindOf(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0]))).toBe('image');
    expect(kindOf(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))).toBe('image');
    expect(kindOf(Buffer.from('<svg></svg>'), 'logo.SVG')).toBe('image');
  });

  it('reads anything without a zero byte as text, a CSV in any encoding', () => {
    expect(kindOf(Buffer.from('Nome;Preço\n', 'latin1'), 'lista.csv')).toBe('text');
    expect(kindOf(Buffer.from([0xff, 0xfe, 0x4e, 0x00]))).toBe('text');
    expect(kindOf(Buffer.alloc(0))).toBe('text');
  });

  it('refuses a binary it cannot show, such as a spreadsheet', () => {
    expect(
      kindOf(Buffer.concat([Buffer.from('PK\x03\x04'), Buffer.alloc(40)]), 'a.xlsx'),
    ).toBeNull();
  });
});
