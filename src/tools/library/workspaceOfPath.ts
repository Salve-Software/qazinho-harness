/**
 * Um caminho de transmissão é /<token>/<workspace>; uma requisição sem o token desta
 * inicialização não recebe nada.
 */
export function workspaceOfPath(props: { path: string; token: string }): string | null {
  const [, token, workspace, ...rest] = props.path.split('/');

  if (token !== props.token || !workspace || rest.length > 0) return null;

  try {
    return decodeURIComponent(workspace);
  } catch {
    return null;
  }
}
