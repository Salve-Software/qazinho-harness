import type { RUNNER_JOB_SCHEMA } from '@/engine/runner/constants';
import type { z } from 'zod';

/**
 * A CI job as its runner reads it from QAzinho's API: what to walk, on what, by which
 * agent, and how far it may go.
 */
export type RunnerJob = z.infer<typeof RUNNER_JOB_SCHEMA>;
