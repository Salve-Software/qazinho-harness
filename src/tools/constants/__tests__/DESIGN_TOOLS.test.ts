import { describe, expect, it } from 'vitest';
import { DESIGN_TOOLS } from '@/tools/constants';

describe('DESIGN_TOOLS', () => {
  it('only reads the design, in the session Figma asks for: no tool that writes to it or spends its credits', () => {
    for (const tool of DESIGN_TOOLS) expect(tool).toMatch(/^(get_|create_session$)/);
  });
});
