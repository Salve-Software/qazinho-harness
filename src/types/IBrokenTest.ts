/** A test of the team's suite that broke, as the agent fixing it reads it: its title and where it is written, its project and describes, how it failed with each secret read back as its name, the page Playwright noted, and where its screenshots are. */
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
