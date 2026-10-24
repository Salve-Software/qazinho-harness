/** A file attached to a Jira story, as the agent hears of it: where it was downloaded to, or why it was not. */
export interface IJiraFile {
  filename: string;
  mimeType: string;
  size: number;
  path: string | null;
  note: 'read' | 'too-large' | 'not-readable' | 'too-many' | 'failed';
}
