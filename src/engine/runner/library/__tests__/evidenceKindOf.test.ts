import { describe, expect, it } from 'vitest';
import { evidenceKindOf } from '@/engine/runner/library';

describe('evidenceKindOf', () => {
  it('reads a screen, a video and the requests by the file’s kind', () => {
    expect(evidenceKindOf('/runs/r1/step-1.jpg')).toEqual({
      kind: 'screenshot',
      contentType: 'image/jpeg',
    });
    expect(evidenceKindOf('/runs/r1/run.WEBM')).toEqual({
      kind: 'video',
      contentType: 'video/webm',
    });
    expect(evidenceKindOf('/runs/r1/network.json')).toEqual({
      kind: 'network',
      contentType: 'application/json',
    });
  });

  it('refuses a file a runner never sends', () => {
    expect(evidenceKindOf('/runs/r1/notes.txt')).toBeNull();
  });
});
