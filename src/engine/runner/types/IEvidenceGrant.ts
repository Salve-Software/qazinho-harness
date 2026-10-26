/** Where the API lets a runner upload one file: the key it will be known by, the address to send it to, and the headers that address wants. */
export interface IEvidenceGrant {
  key: string;
  uploadUrl: string;
  headers: Record<string, string>;
}
