import type { Language } from '@/contract';

export const THEME_NAMES: Record<
  Language,
  { night: string; paper: string; system: string }
> = {
  en: { night: 'Night', paper: 'Paper', system: 'System' },
  pt: { night: 'Noite', paper: 'Papel', system: 'Sistema' },
};
