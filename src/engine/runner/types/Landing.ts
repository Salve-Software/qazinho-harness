/**
 * Onde uma falha ou um achado cai entre os bugs: num que o job nomeou, num que esta run
 * já abriu, ou como bug novo.
 */
export type Landing =
  { kind: 'known'; bugId: string } | { kind: 'filed'; bugId: string } | { kind: 'new' };
