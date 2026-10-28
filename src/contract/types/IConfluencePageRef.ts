/**
 * Uma página do Confluence como o QAzinho aponta para ela: o id, o título, o espaço em
 * que está e onde abre.
 */
export interface IConfluencePageRef {
  id: string;
  title: string;
  space: string;
  url: string;
}
