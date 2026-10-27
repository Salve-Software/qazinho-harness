/**
 * A stream path is /<token>/<workspace>; a request without this launch's token gets
 * nothing.
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
