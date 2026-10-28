/**
 * As palavras de shell que trazem a activity de abertura de um app para a frente; o
 * monkey não manda tecla de sistema, que um aparelho sem teclas físicas recusa.
 */
export function launchArgs(app: string): string[] {
  return [
    'monkey',
    '--pct-syskeys',
    '0',
    '-p',
    app,
    '-c',
    'android.intent.category.LAUNCHER',
    '1',
  ];
}
