/** An environment with one PATH: Windows names its own `Path`, and a `PATH` QAzinho set beside it must be the one the child reads. */
export function envWithOnePath(props: {
  env: NodeJS.ProcessEnv;
  platform: NodeJS.Platform;
}): NodeJS.ProcessEnv {
  const keys = Object.keys(props.env).filter((key) => key.toUpperCase() === 'PATH');

  if (props.platform !== 'win32' || keys.length < 2) return props.env;

  const kept = keys.includes('PATH') ? 'PATH' : keys[keys.length - 1];

  return Object.fromEntries(
    Object.entries(props.env).filter(
      ([key]) => key.toUpperCase() !== 'PATH' || key === kept,
    ),
  );
}
