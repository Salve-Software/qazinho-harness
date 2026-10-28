const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
};

/** O uiautomator escapa o que um rótulo pode conter, e o agente deve ler o rótulo. */
export function decodeXml(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|apos);/g, (one) => ENTITIES[one] ?? one);
}
