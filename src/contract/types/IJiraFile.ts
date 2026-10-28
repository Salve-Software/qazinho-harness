/**
 * Um arquivo anexado a uma story do Jira, como o agente fica sabendo dele: para onde foi
 * baixado, ou por que não foi.
 */
export interface IJiraFile {
  filename: string;
  mimeType: string;
  size: number;
  path: string | null;
  note: 'read' | 'too-large' | 'not-readable' | 'too-many' | 'failed';
}
