import { runAdbRaw } from './runAdbRaw';

/**
 * Toda palavra que o QAzinho diz a um aparelho passa por aqui, para um lugar só saber
 * onde está o adb.
 */
export async function runAdb(props: { adb: string; args: string[] }): Promise<string> {
  return (await runAdbRaw(props)).toString('utf8');
}
