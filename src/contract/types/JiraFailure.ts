/** Why Jira did not answer what QAzinho asked: not connected, the token refused, the issue or project not there, out of reach, what was sent refused, or something else. */
export type JiraFailure =
  | 'not-connected'
  | 'unauthorized'
  | 'not-found'
  | 'unreachable'
  | 'rejected'
  | 'unexpected';
