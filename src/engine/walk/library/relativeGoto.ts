/**
 * O endereço que uma gravação guarda: só o caminho quando é o próprio app, para ela andar
 * em outro ambiente dele; um site de fora fica como está.
 */
export function relativeGoto(props: { target: string; appUrl: string }): string {
  try {
    const app = new URL(props.appUrl);
    const url = new URL(props.target);

    return url.origin === app.origin
      ? `${url.pathname}${url.search}${url.hash}`
      : props.target;
  } catch {
    return props.target;
  }
}
