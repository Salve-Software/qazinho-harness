/** Where a finger starts and ends to bring into view what lies in a direction: it moves the other way, across the middle of the screen. */
export function swipeOf(props: {
  size: { width: number; height: number };
  direction: string;
}): { from: { x: number; y: number }; to: { x: number; y: number } } {
  const { width, height } = props.size;
  const middle = { x: Math.round(width / 2), y: Math.round(height / 2) };
  const near = (share: number, length: number) => Math.round(length * share);

  switch (props.direction) {
    case 'up':
      return {
        from: { x: middle.x, y: near(0.3, height) },
        to: { x: middle.x, y: near(0.7, height) },
      };
    case 'right':
      return {
        from: { x: near(0.8, width), y: middle.y },
        to: { x: near(0.2, width), y: middle.y },
      };
    case 'left':
      return {
        from: { x: near(0.2, width), y: middle.y },
        to: { x: near(0.8, width), y: middle.y },
      };
    default:
      return {
        from: { x: middle.x, y: near(0.7, height) },
        to: { x: middle.x, y: near(0.3, height) },
      };
  }
}
