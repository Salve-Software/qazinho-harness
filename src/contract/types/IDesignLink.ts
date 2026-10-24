/** The Figma design a workspace is checked against: the file, and the frame or page its link points at when it names one. */
export interface IDesignLink {
  url: string;
  fileKey: string;
  nodeId: string | null;
  name: string;
}
