/**
 * A broken test of the team's suite as its fixer reads it: where it is, how it failed and
 * its screens.
 */
export interface IBrokenTest {
  title: string;
  file: string;
  line: number;
  project: string;
  path: string[];
  error: string;
  notes: string;
  screenshots: string[];
}
