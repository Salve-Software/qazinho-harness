import type { SuiteToolRead } from '@/tools/servers/suite/types';
import { SUITE_TOOLS } from '@/tools/servers/suite/constants';

const OUTSIDE = /(^|[\\/])\.\.([\\/]|$)/;

/**
 * Lê uma chamada de ferramenta da suíte contra o schema; uma chamada que o quebra, ou que
 * nomeia um teste fora da pasta da suíte, é recusada com o motivo.
 */
export function readSuiteToolCall(props: {
  name: string;
  args: Record<string, unknown> | undefined;
}): SuiteToolRead {
  const tool = SUITE_TOOLS.find(({ name }) => name === props.name);

  if (!tool)
    return { kind: 'refused', error: `There is no tool called "${props.name}".` };

  const read = tool.input.safeParse(props.args ?? {});

  if (!read.success)
    return { kind: 'refused', error: read.error.issues[0]?.message ?? 'Call it again.' };

  const outside = read.data.tests.find(
    (test) => test.startsWith('/') || /^[a-z]:/i.test(test) || OUTSIDE.test(test),
  );

  if (outside !== undefined)
    return {
      kind: 'refused',
      error: `"${outside}" is outside the suite's folder: name each test from the suite's folder, such as tests/login.spec.ts:12.`,
    };

  return {
    kind: 'call',
    call: { tests: read.data.tests, project: read.data.project ?? '' },
  };
}
