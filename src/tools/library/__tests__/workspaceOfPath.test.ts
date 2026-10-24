import { describe, expect, it } from 'vitest';
import { workspaceOfPath } from '@/tools/library';

describe('workspaceOfPath', () => {
  it('reads the workspace out of a path carrying this launch token', () => {
    expect(workspaceOfPath({ path: '/t0k/w%201', token: 't0k' })).toBe('w 1');
  });

  it('does NOT answer a path with another token', () => {
    expect(workspaceOfPath({ path: '/guess/w1', token: 't0k' })).toBeNull();
  });

  it('refuses a path with no workspace, extra segments or broken escapes', () => {
    expect(workspaceOfPath({ path: '/t0k/', token: 't0k' })).toBeNull();
    expect(workspaceOfPath({ path: '/t0k/w1/more', token: 't0k' })).toBeNull();
    expect(workspaceOfPath({ path: '/t0k/%E0%A4%A', token: 't0k' })).toBeNull();
  });
});
