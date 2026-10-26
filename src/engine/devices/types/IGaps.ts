/** The space between something on screen and the nearest thing on each side of it; null where nothing sits on that side. */
export interface IGaps {
  above: number | null;
  below: number | null;
  left: number | null;
  right: number | null;
}
