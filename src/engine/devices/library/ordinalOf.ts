/**
 * Lê "Buy #2" como o segundo controle que diz "Buy"; um nome sem número é o primeiro, e
 * diz que não tinha número.
 */
export function ordinalOf(target: string): {
  name: string;
  nth: number;
  isNumbered: boolean;
} {
  const numbered = /^(.*\S)\s+#(\d+)$/.exec(target.trim());

  return numbered === null
    ? { name: target.trim(), nth: 0, isNumbered: false }
    : {
        name: numbered[1] ?? target.trim(),
        nth: Math.max(Number(numbered[2]) - 1, 0),
        isNumbered: true,
      };
}
