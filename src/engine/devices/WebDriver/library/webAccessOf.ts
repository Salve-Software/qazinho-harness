import type { IWebAccess } from '@/engine/devices/WebDriver/types';

const BYPASS = 'VERCEL_AUTOMATION_BYPASS_SECRET';
const USER = 'BASIC_AUTH_USER';
const PASSWORD = 'BASIC_AUTH_PASSWORD';

/**
 * What lets a run into a protected environment, out of the project's variables by their
 * names: Vercel's bypass for automation, and a browser sign-in's user and password.
 */
export function webAccessOf(variables: { name: string; value: string }[]): IWebAccess {
  const valueOf = (name: string) =>
    variables.find((variable) => variable.name === name)?.value.trim() ?? '';
  const bypass = valueOf(BYPASS);
  const username = valueOf(USER);

  return {
    headers:
      bypass === ''
        ? {}
        : { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' },
    credentials: username === '' ? null : { username, password: valueOf(PASSWORD) },
  };
}
