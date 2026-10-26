/** The option a fill means on a dropdown: its words or its value, exact first, then regardless of case; null when none does. */
export function optionOf(props: {
  options: { label: string; value: string }[];
  wanted: string;
}): { label: string; value: string } | null {
  const wanted = props.wanted.trim();
  const folded = wanted.toLowerCase();

  return (
    props.options.find(
      ({ label, value }) => label.trim() === wanted || value === wanted,
    ) ??
    props.options.find(
      ({ label, value }) =>
        label.trim().toLowerCase() === folded || value.toLowerCase() === folded,
    ) ??
    null
  );
}
