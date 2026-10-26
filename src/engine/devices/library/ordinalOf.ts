/** Reads "Buy #2" as the second control that reads "Buy"; a name with no number is the first, and says it had none. */
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
