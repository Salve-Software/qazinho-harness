import { describe, expect, it } from 'vitest';
import { TOOL_GRANTS } from '@/tools/constants';

describe('TOOL_GRANTS', () => {
  /**
   * O chat planejava a partir da história e do design sem nunca ver o app, e errava os nomes
   * dos botões: agora ele anda pelo app no dispositivo do QAzinho antes de planejar.
   */
  it('hands the device to the runner, the explorer and the chat that learns the app', () => {
    const device = TOOL_GRANTS.find(({ group }) => group === 'device');

    expect(device?.roles).toEqual(['runner', 'explorer', 'chat']);
  });

  it('hands the app to the assistant only: a run or a chat never renames, runs or deletes', () => {
    const app = TOOL_GRANTS.find(({ group }) => group === 'app');

    expect(app?.roles).toEqual(['assistant']);
  });
});
