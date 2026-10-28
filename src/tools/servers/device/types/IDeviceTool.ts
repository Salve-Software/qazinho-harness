import type { z } from 'zod';

/**
 * Uma ferramenta do dispositivo: o nome, o que o agente lê sobre ela, e os argumentos que
 * recebe.
 */
export interface IDeviceTool {
  name: string;
  description: string;
  input: z.ZodObject;
}
