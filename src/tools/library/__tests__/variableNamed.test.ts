import { describe, expect, it } from 'vitest';
import { variableNamed } from '@/tools/library';

const NAME = variableNamed('Name it in capitals.');

describe('variableNamed', () => {
  it('takes the name of a variable, trimmed and in capitals', () => {
    expect(NAME.parse(' otp_code ')).toBe('OTP_CODE');
  });

  it('says back the message for what cannot be a name', () => {
    for (const value of ['the code', '2FA_CODE', 'OTP-CODE', '', 7])
      expect(NAME.safeParse(value).error?.issues[0]?.message).toBe(
        'Name it in capitals.',
      );
  });

  /**
   * O cofre recusa um nome mais longo que isto, então o agente precisa ouvir antes de o
   * QA digitar um valor.
   */
  it('does NOT take a name longer than the vault keeps', () => {
    expect(NAME.safeParse(`A${'B'.repeat(63)}`).success).toBe(true);
    expect(NAME.safeParse(`A${'B'.repeat(64)}`).success).toBe(false);
  });
});
