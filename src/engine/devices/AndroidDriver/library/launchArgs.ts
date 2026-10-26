/** The shell words that bring an app's launcher activity to the front; monkey sends no system key, which a device without physical keys refuses. */
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
