/**
 * Por que o Jira não respondeu o que o QAzinho pediu: não conectado, token recusado,
 * issue ou projeto inexistente, fora de alcance, envio recusado, ou outra coisa.
 */
export type JiraFailure =
  | 'not-connected'
  | 'unauthorized'
  | 'not-found'
  | 'unreachable'
  | 'rejected'
  | 'unexpected';
