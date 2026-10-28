/**
 * Como uma página se mexeu enquanto uma ação rodava: deslocamentos de layout (todos, e os
 * sem uma entrada que os explique) e frames longos.
 */
export interface IActionMotion {
  shift: number;
  unexpectedShift: number;
  shifts: number;
  longFrames: number;
  slowestFrameMs: number;
}
