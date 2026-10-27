/**
 * A time a bug was caught, as a runner sends it: the run by its own id and when it
 * started, the step, its screen's key and its moment in seconds into the video.
 */
export interface ISightingBody {
  runId: string;
  runWhen: string;
  caseId: string;
  stepNumber: number;
  shot: string | null;
  at: number | null;
}
