/**
 * Lê "Carrinho4" ou "Carrinho 4" como um nome com contador no fim, para achá-lo quando o
 * número muda; null quando o nome não termina num número depois de letras.
 */
export function countedOf(target: string): RegExp | null {
  const counted = /^(.*\p{L})\s*\d+$/u.exec(target.trim());
  const base = counted?.[1];

  return base === undefined
    ? null
    : new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\d+$`, 'u');
}
