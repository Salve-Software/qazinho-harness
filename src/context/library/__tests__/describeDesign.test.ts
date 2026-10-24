import { describe, expect, it } from 'vitest';
import { describeDesign } from '@/context/library';

const DESIGN = {
  url: 'https://www.figma.com/design/AbC123/Shop?node-id=1-23',
  fileKey: 'AbC123',
  nodeId: '1:23',
  name: 'Shop "v2"',
};

describe('describeDesign', () => {
  it('names the file and the node the agent reads through its Figma tools', () => {
    expect(describeDesign({ design: DESIGN, wasTold: false })).toEqual({
      title: 'The Figma design',
      lines: [
        'The app is checked against the Figma design "Shop \'v2\'": https://www.figma.com/design/AbC123/Shop?node-id=1-23',
        'fileKey: AbC123',
        'nodeId: 1:23, the frame or page the link points at.',
      ],
    });
  });

  it('starts from the pages when the link names no node', () => {
    expect(
      describeDesign({ design: { ...DESIGN, nodeId: null }, wasTold: false }).lines[2],
    ).toBe('The link names no node: start from the file’s pages.');
  });

  it('says once that the design is gone, and says nothing when there never was one', () => {
    expect(describeDesign({ design: null, wasTold: true }).lines).toEqual([
      'The workspace has no Figma design any more: plan from the app and the QA.',
    ]);
    expect(describeDesign({ design: null, wasTold: false }).lines).toEqual([]);
  });
});
