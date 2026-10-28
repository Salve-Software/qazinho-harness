import { z } from 'zod';
import { VARIABLE_NAME } from '@/contract';

/**
 * O nome de uma variável, como OTP_CODE, lido em maiúsculas; qualquer coisa que não possa
 * ser um responde `message`.
 */
export function variableNamed(message: string) {
  return z
    .string({ error: message })
    .trim()
    .toUpperCase()
    .regex(VARIABLE_NAME.pattern, { error: message })
    .max(VARIABLE_NAME.maxLength, { error: message });
}
