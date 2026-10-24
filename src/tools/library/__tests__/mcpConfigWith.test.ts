import { describe, expect, it } from 'vitest';
import { mcpConfigWith } from '@/tools/library';

const FIGMA = { name: 'figma', url: 'https://mcp.figma.com/mcp' };

describe('mcpConfigWith', () => {
  it('lists the QA’s server beside QAzinho’s, keeping how long a call may take', () => {
    const config = JSON.stringify({
      mcpServers: {
        qazinho: { type: 'http', url: 'http://127.0.0.1:5000/t/w1', timeout: 900_000 },
      },
    });

    expect(JSON.parse(mcpConfigWith({ config, servers: [FIGMA] }) ?? '')).toEqual({
      mcpServers: {
        qazinho: { type: 'http', url: 'http://127.0.0.1:5000/t/w1', timeout: 900_000 },
        figma: { type: 'http', url: 'https://mcp.figma.com/mcp' },
      },
    });
  });

  it('makes a config of the QA’s server alone for a call that had none', () => {
    expect(JSON.parse(mcpConfigWith({ config: null, servers: [FIGMA] }) ?? '')).toEqual({
      mcpServers: { figma: { type: 'http', url: 'https://mcp.figma.com/mcp' } },
    });
  });

  it('leaves the config as it was when there is no server to add', () => {
    expect(mcpConfigWith({ config: null, servers: [] })).toBeNull();
    expect(mcpConfigWith({ config: '{"mcpServers":{}}', servers: [] })).toBe(
      '{"mcpServers":{}}',
    );
  });
});
