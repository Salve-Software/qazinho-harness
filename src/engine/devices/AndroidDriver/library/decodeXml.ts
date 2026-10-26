const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
};

/** uiautomator escapes what a label may contain, and the agent should read the label. */
export function decodeXml(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot|apos);/g, (one) => ENTITIES[one] ?? one);
}
