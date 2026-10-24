import type { ISuiteTestsCall } from './ISuiteTestsCall';

/** Who runs a suite's tests for an agent changing it, under the scope its address carries, and answers with how they went. */
export interface IAttachSuite {
  scope: string;
  runTests: (call: ISuiteTestsCall) => Promise<{ text: string; isError: boolean }>;
}
