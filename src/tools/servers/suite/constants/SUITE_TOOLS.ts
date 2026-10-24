import { z } from 'zod';

export const SUITE_TOOLS = [
  {
    name: 'run_tests',
    description:
      'Run tests of the suite in your folder with its own Playwright and the settings the team runs it with, and read how each went: its error, the page as it was when it failed, and where its screenshot is.',
    input: z.object({
      tests: z
        .array(z.string().trim().min(1), {
          error: '"run_tests" needs "tests": where each test is written.',
        })
        .min(1, { error: '"run_tests" needs at least one test in "tests".' })
        .max(20, { error: 'Run at most 20 tests at a time.' })
        .describe(
          "Where each test is written, from the suite's folder: a file, or a file and the line its test starts on, such as tests/hc-1139/ct-nav.spec.ts:12.",
        ),
      project: z
        .string()
        .trim()
        .optional()
        .describe(
          'The Playwright project to run them in. Leave it out to run them in every project of the config.',
        ),
    }),
  },
] as const;
