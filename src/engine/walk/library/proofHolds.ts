function plain(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Whether the screen still shows the words that proved a step, read the way a person would: case and spacing aside. */
export function proofHolds(props: { screen: string; proof: string }): boolean {
  const proof = plain(props.proof);

  return proof.length > 0 && plain(props.screen).includes(proof);
}
