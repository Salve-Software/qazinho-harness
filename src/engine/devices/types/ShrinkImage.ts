/**
 * Reduz uma captura de tela ao tamanho que o agente lê, com um filtro que mantém linhas
 * finas, e a devolve como JPEG.
 */
export type ShrinkImage = (props: {
  image: Buffer;
  width: number;
  height: number;
  quality: number;
}) => Buffer;
