import { parseSimulators } from './parseSimulators';
import { runTool } from './runTool';

/**
 * Os simuladores que o QA já tem. O QAzinho nunca cria um, do mesmo jeito que nunca
 * instala o idb.
 */
export async function listSimulators(): Promise<string[]> {
  const listed = await runTool({
    command: 'xcrun',
    args: ['simctl', 'list', 'devices', 'available'],
  }).catch(() => '');

  return parseSimulators(listed);
}
