import { z } from 'zod';

export const BUILD_ANSWER = z.object({
  artifact: z
    .string()
    .describe(
      'The absolute path of the .apk or .app the build made; empty when it made none.',
    ),
  summary: z.string().describe('What was built, in one sentence.'),
  failure: z
    .string()
    .describe(
      'Why there is no .apk or .app, for a QA to read; empty when the build worked.',
    ),
});
