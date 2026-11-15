/**
 * O `emulator-user.ini` de um AVD com a janela no lugar pedido, o resto dele como estava:
 * o emulador abre a janela onde esse arquivo diz.
 */
export function withWindowAt(props: { ini: string; x: number; y: number }): string {
  const values = { 'window.x': props.x, 'window.y': props.y };
  const lines = props.ini.split('\n').filter((line) => line.trim() !== '');
  const kept = lines.filter(
    (line) => !Object.keys(values).some((key) => line.trim().startsWith(`${key} `)),
  );

  return [
    ...kept,
    ...Object.entries(values).map(
      ([key, value]) => `${key} = ${String(Math.round(value))}`,
    ),
  ]
    .join('\n')
    .concat('\n');
}
