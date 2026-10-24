import { z } from 'zod';
import { VARIABLE_NAME } from '@/contract';

/** The name of a variable, such as OTP_CODE, read in capitals; anything that cannot be one says back `message`. */
export function variableNamed(message: string) {
  return z
    .string({ error: message })
    .trim()
    .toUpperCase()
    .regex(VARIABLE_NAME.pattern, { error: message })
    .max(VARIABLE_NAME.maxLength, { error: message });
}
