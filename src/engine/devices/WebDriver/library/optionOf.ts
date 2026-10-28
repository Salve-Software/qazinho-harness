/**
 * A opção que um preenchimento quer dizer num dropdown: as palavras ou o valor, exato
 * primeiro, depois sem diferenciar maiúsculas; null quando nenhuma serve.
 */
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
