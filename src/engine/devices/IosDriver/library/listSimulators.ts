import { parseSimulators } from './parseSimulators';
import { runTool } from './runTool';

/** The simulators the QA already has. QAzinho never creates one, the way it never installs idb. */
export async function listSimulators(): Promise<string[]> {
  const listed = await runTool({
    command: 'xcrun',
    args: ['simctl', 'list', 'devices', 'available'],
  }).catch(() => '');

  return parseSimulators(listed);
}
