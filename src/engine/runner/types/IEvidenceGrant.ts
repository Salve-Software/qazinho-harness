/**
 * Onde a API deixa um runner subir um arquivo: a chave pela qual ele será conhecido, o
 * endereço para onde mandá-lo, e os headers que esse endereço quer.
 */
export interface IEvidenceGrant {
  key: string;
  uploadUrl: string;
  headers: Record<string, string>;
}
