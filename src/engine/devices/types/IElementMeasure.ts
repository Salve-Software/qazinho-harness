import type { IBox } from './IBox';
import type { IElementStyle } from './IElementStyle';
import type { IGaps } from './IGaps';

/** One thing on the device's screen, measured to hold it to a design: its box, the box it sits in, the space around it, and in a browser its style. */
export interface IElementMeasure {
  role: string;
  text: string;
  unit: 'px' | 'dp' | 'pt';
  box: IBox;
  parent: IBox | null;
  gaps: IGaps;
  style: IElementStyle | null;
}
