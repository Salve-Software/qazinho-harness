/** Como uma gravação nomeia um arquivo em qualquer máquina: conteúdo e nome. */
export function fileRefOf(props: { sha256: string; name: string }): string {
  return `${props.sha256}/${props.name}`;
}
