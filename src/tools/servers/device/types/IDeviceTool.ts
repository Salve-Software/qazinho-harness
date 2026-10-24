import type { z } from 'zod';

/** One tool on the device: its name, what the agent reads about it, and the arguments it takes. */
export interface IDeviceTool {
  name: string;
  description: string;
  input: z.ZodObject;
}
