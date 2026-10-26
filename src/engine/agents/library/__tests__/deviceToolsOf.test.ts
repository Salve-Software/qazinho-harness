import { describe, expect, it } from 'vitest';
import { deviceToolsOf } from '@/engine/agents';

describe('deviceToolsOf', () => {
  it('hands a walk its tools with a JSON Schema each, and none of an exploration’s', () => {
    const tools = deviceToolsOf('walk');
    const click = tools.find(({ name }) => name === 'click');

    expect(tools.map(({ name }) => name)).toContain('report');
    expect(tools.map(({ name }) => name)).not.toContain('finish');
    expect(click?.input_schema).toMatchObject({
      type: 'object',
      properties: { target: { type: 'string' } },
    });
    expect(click?.input_schema).not.toHaveProperty('$schema');
  });

  it('hands an exploration its finish, and no report', () => {
    const names = deviceToolsOf('explore').map(({ name }) => name);

    expect(names).toContain('finish');
    expect(names).not.toContain('report');
  });
});
