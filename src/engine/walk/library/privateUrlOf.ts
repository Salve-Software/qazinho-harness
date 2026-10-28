import type { IVariableValue } from '@/engine/types';
import { RUN_WALK, SECRET_PARAMS } from '@/engine/walk/constants';

/**
 * O endereço de uma requisição seguro de guardar: o valor de uma variável nele lido como
 * o seu ${NAME}, e a senha e os valores de chaves com cara de segredo como pontos.
 */
export function privateUrlOf(props: { url: string; values: IVariableValue[] }): string {
  const named = props.values
    .filter(({ value }) => value.length >= RUN_WALK.hiddenFromLength)
    .sort((one, other) => other.value.length - one.value.length)
    .reduce(
      (url, { name, value }) =>
        [value, encodeURIComponent(value)].reduce(
          (text, form) => text.split(form).join(`\${${name}}`),
          url,
        ),
      props.url,
    );

  return named
    .replace(/^([a-z]+:\/\/[^/:@]+):[^/@]+@/i, `$1:${SECRET_PARAMS.hidden}@`)
    .replace(/([?&#])([^=&#]+)=([^&#]*)/g, (whole: string, ...parts: string[]) => {
      const [mark = '', key = '', value = ''] = parts;
      const isSecret =
        SECRET_PARAMS.anywhere.test(keyOf(key)) || SECRET_PARAMS.whole.test(keyOf(key));

      return value.length > 0 && isSecret
        ? `${mark}${key}=${SECRET_PARAMS.hidden}`
        : whole;
    });
}

function keyOf(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
