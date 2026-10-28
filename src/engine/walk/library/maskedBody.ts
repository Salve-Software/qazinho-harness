import { SECRET_PARAMS } from '@/engine/walk/constants';

const JWT = /eyJ[\w-]{6,}\.[\w-]{6,}\.[\w-]{6,}/g;

const PAIR = /("?)([\w-]+)\1(\s*[:=]\s*)("(?:[^"\\]|\\.)*"|[^\s,;&}]+)/g;

/**
 * O que uma chamada de API respondeu, seguro de mostrar ou guardar: os valores de chaves
 * com cara de segredo e o que tem forma de token como pontos, em JSON ou texto.
 */
export function maskedBody(text: string): string {
  try {
    return JSON.stringify(masked(JSON.parse(text), ''));
  } catch {
    return text
      .replace(PAIR, (whole: string, ...parts: string[]) => {
        const [quote = '', key = '', glue = ''] = parts;

        return isSecretKey(key)
          ? `${quote}${key}${quote}${glue}${SECRET_PARAMS.hidden}`
          : whole;
      })
      .replace(JWT, SECRET_PARAMS.hidden);
  }
}

function isSecretKey(key: string): boolean {
  return SECRET_PARAMS.anywhere.test(key) || SECRET_PARAMS.whole.test(key);
}

function masked(value: unknown, key: string): unknown {
  if (isSecretKey(key) && value !== null && typeof value !== 'object')
    return SECRET_PARAMS.hidden;

  if (Array.isArray(value)) return value.map((item) => masked(item, ''));

  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([name, inner]) => [name, masked(inner, name)]),
    );

  return typeof value === 'string' ? value.replace(JWT, SECRET_PARAMS.hidden) : value;
}
