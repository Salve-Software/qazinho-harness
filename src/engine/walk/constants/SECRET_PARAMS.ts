export const SECRET_PARAMS = {
  anywhere:
    /(token|secret|passw|pwd|auth|session|signature|api[-_]?key|jwt|credential|otp)/i,
  whole: /^(key|code|sig|sid)$/i,
  hidden: '•••',
} as const;
