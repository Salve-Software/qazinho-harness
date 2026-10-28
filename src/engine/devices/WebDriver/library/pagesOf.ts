const LEAVING =
  /\/(logout|log-out|signout|sign-out|sair|delete|remove|excluir|apagar|destroy)(\/|$|\?)/i;

/**
 * As páginas a que um menu leva no próprio site do app, uma vez cada, em ordem: nenhum
 * outro site, nenhuma âncora, nada que saia da conta ou apague.
 */
export function pagesOf(props: { hrefs: string[]; current: string }): string[] {
  let origin: string;
  let here: string;

  try {
    const current = new URL(props.current);

    origin = current.origin;
    here = `${current.origin}${current.pathname}${current.search}`;
  } catch {
    return [];
  }

  const pages: string[] = [];

  for (const href of props.hrefs) {
    let url: URL;

    try {
      url = new URL(href, props.current);
    } catch {
      continue;
    }

    const page = `${url.origin}${url.pathname}${url.search}`;

    if (url.origin !== origin || page === here || LEAVING.test(url.pathname)) continue;
    if (!pages.includes(page)) pages.push(page);
  }

  return pages;
}
