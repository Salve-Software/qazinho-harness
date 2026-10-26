import type { IVariableValue } from '@/engine/types';
import { RUN_WALK, SECRET_PARAMS } from '@/engine/walk/constants';

function keyOf(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** A request's address safe to keep: a variable's value in it reads as its ${NAME}, and the password in it and the values of secret-looking keys as dots. */
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
