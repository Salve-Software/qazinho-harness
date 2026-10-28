/** Um arquivo anexado a uma issue do Jira, como o Jira o lista. */
export interface IJiraAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}
