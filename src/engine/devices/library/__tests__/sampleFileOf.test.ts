import { describe, expect, it } from 'vitest';
import { sampleFileOf } from '@/engine/devices/library';

describe('sampleFileOf', () => {
  it('hands a real file of each kind: a PNG, a PDF, a CSV and a text', () => {
    expect(sampleFileOf('image').bytes.subarray(1, 4).toString()).toBe('PNG');
    expect(sampleFileOf('pdf').bytes.subarray(0, 5).toString()).toBe('%PDF-');
    expect(sampleFileOf('csv').bytes.toString()).toMatch(/^name,email\n/);
    expect(sampleFileOf('text')).toMatchObject({ name: 'qazinho-sample.txt' });
  });

  it('hands a text file for a kind it does not know', () => {
    expect(sampleFileOf('video').name).toBe('qazinho-sample.txt');
  });
});
