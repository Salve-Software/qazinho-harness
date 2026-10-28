import type { IWebAccess } from '@/engine/devices/WebDriver/types';

const BYPASS = 'VERCEL_AUTOMATION_BYPASS_SECRET';
const USER = 'BASIC_AUTH_USER';
const PASSWORD = 'BASIC_AUTH_PASSWORD';

/**
 * O que abre um ambiente protegido para uma run, pelas variáveis do projeto: o bypass de
 * automação da Vercel, e usuário e senha de um login do navegador.
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
