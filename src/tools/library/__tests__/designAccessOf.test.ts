import { describe, expect, it } from 'vitest';
import { designAccessOf } from '@/tools/library';

const DESIGN = {
  url: 'https://www.figma.com/design/AbC123/Shop?node-id=1-23',
  fileKey: 'AbC123',
  nodeId: '1:23',
  name: 'Shop',
};

describe('designAccessOf', () => {
  it('lists the QA’s Figma server, and only the tools of it that read', () => {
    expect(designAccessOf(DESIGN)).toEqual({
      servers: [{ name: 'figma', url: 'https://mcp.figma.com/mcp' }],
      allowedTools: [
        'mcp__figma__create_session',
        'mcp__figma__get_design_context',
        'mcp__figma__get_metadata',
        'mcp__figma__get_screenshot',
        'mcp__figma__get_variable_defs',
      ],
    });
  });

  it('gives a workspace with no design nothing of Figma', () => {
    expect(designAccessOf(null)).toEqual({ servers: [], allowedTools: [] });
  });
});
