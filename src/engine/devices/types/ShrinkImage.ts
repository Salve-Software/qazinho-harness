/** Scales a screenshot down to the size the agent reads, with a filter that keeps hairlines, and gives it back as a JPEG. */
export type ShrinkImage = (props: {
  image: Buffer;
  width: number;
  height: number;
  quality: number;
}) => Buffer;
