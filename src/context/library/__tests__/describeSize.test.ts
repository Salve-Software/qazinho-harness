import { describe, expect, it } from 'vitest';
import { describeSize } from '@/context/library';

describe('describeSize', () => {
  it('names the size every case of a web run gets, and how to cover another', () => {
    const lines = describeSize({ width: 390, height: 844 });

    expect(lines[0]).toContain('390 × 844');
    expect(lines[1]).toContain('switches the device and runs the plan again');
  });

  it('says nothing for a phone or a simulator, which keep the size they are', () => {
    expect(describeSize(null)).toEqual([]);
  });
});
