import type { RUNNER_JOB_SCHEMA } from '@/engine/runner/constants';
import type { z } from 'zod';

/**
 * Um job do CI como o runner o lê da API do QAzinho: o que andar, em quê, com qual
 * agente, e até onde pode ir.
 */
export type RunnerJob = z.infer<typeof RUNNER_JOB_SCHEMA>;
