/**
 * Para onde um `goto` vai: um caminho, que uma gravação guarda, sobre o endereço em que o
 * app abriu nesta run, e um endereço inteiro como está.
 */
export function gotoAddressOf(props: { target: string; appUrl: string }): string {
  try {
    return new URL(props.target, props.appUrl).href;
  } catch {
    return props.target;
  }
}
