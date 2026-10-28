import type { IBox } from './IBox';
import type { IElementStyle } from './IElementStyle';
import type { IGaps } from './IGaps';

/**
 * Uma coisa da tela do dispositivo, medida para conferir com um design: a caixa, a caixa
 * em que está, o espaço em volta, e num navegador o estilo.
 */
export interface IElementMeasure {
  role: string;
  text: string;
  unit: 'px' | 'dp' | 'pt';
  box: IBox;
  parent: IBox | null;
  gaps: IGaps;
  style: IElementStyle | null;
}
