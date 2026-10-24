/** A call to run some of the suite's tests: where each is written, from the suite's folder, and the Playwright project to run them in, '' for every one. */
export interface ISuiteTestsCall {
  tests: string[];
  project: string;
}
