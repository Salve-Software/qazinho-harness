const FILE_REF = /^([0-9a-f]{64})\/([^/\\]+)$/;

/** O conteúdo e o nome que uma referência de arquivo guarda; null para um caminho. */
export function readFileRef(file: string): { sha256: string; name: string } | null {
  const read = FILE_REF.exec(file);

  return read?.[1] === undefined || read[2] === undefined
    ? null
    : { sha256: read[1], name: read[2] };
}
