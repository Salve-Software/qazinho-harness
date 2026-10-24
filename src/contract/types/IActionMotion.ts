/** How a page moved while one action ran: layout shifts (all, and with no input to explain them) and long frames. */
export interface IActionMotion {
  shift: number;
  unexpectedShift: number;
  shifts: number;
  longFrames: number;
  slowestFrameMs: number;
}
