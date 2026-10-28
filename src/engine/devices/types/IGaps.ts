/**
 * O espaço entre algo na tela e a coisa mais próxima de cada lado; null onde nada fica
 * daquele lado.
 */
export interface IGaps {
  above: number | null;
  below: number | null;
  left: number | null;
  right: number | null;
}
