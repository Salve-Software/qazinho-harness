/**
 * Lê "Comprar · Camiseta Básica" como o controle "Comprar" do lugar "Camiseta Básica";
 * null quando o alvo não nomeia um lugar.
 */
export function placedOf(target: string): { name: string; place: string } | null {
  const at = target.lastIndexOf(' · ');

  if (at === -1) return null;

  const name = target.slice(0, at).trim();
  const place = target.slice(at + 3).trim();

  return name.length === 0 || place.length === 0 ? null : { name, place };
}
