/**
 * Os arquivos que o QA anexou a uma mensagem do chat: a pasta em que o host os guarda, e
 * cada um pelo nome, o caminho e se é imagem.
 */
export interface IAttachedFiles {
  root: string;
  files: { name: string; path: string; isImage: boolean }[];
}
