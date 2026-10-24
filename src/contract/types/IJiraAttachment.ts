/** A file attached to a Jira issue, as Jira lists it. */
export interface IJiraAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}
