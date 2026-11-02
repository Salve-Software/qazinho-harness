/** O texto sem a tag que um agente fechou no fim sem nunca abrir, como um `</got>`. */
export function withoutStrayTags(text: string): string {
  const closing = /\s*<\/([\w:-]+)>\s*$/.exec(text);

  if (closing === null || text.includes(`<${closing[1] ?? ''}`)) return text;

  return withoutStrayTags(text.slice(0, closing.index));
}
