/**
 * O design do Figma contra o qual um workspace é conferido: o arquivo, e o frame ou
 * página para que o link aponta quando nomeia um.
 */
export interface IDesignLink {
  url: string;
  fileKey: string;
  nodeId: string | null;
  name: string;
}
