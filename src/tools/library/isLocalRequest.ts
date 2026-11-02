const LOCAL_HOSTS = ['127.0.0.1', 'localhost'];

/**
 * Se um pedido veio de um programa desta máquina e pelo nome dela: uma página aberta num
 * navegador manda um Origin, e um rebinding de DNS manda outro Host.
 */
export function isLocalRequest(props: {
  host: string | undefined;
  origin: string | undefined;
  port: number;
}): boolean {
  const here = LOCAL_HOSTS.map((name) => `${name}:${String(props.port)}`);

  if (props.host === undefined || !here.includes(props.host)) return false;

  return (
    props.origin === undefined || here.some((host) => props.origin === `http://${host}`)
  );
}
