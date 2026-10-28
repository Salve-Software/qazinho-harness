/**
 * Uma requisição que o app fez durante uma run e como terminou; `body` traz o começo do
 * que uma chamada de API que falhou respondeu.
 */
export interface INetworkEntry {
  id: number;
  method: string;
  url: string;
  type: string;
  status: number | null;
  failure: string | null;
  startedAt: number;
  durationMs: number | null;
  size: number | null;
  body?: string;
}
