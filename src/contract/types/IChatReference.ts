/** Algo que o QA apontou com @ no chat, com os fatos que o QAzinho guarda sobre isso. */
export interface IChatReference {
  kind: 'run' | 'bug' | 'case';
  id: string;
  title: string;
  facts: string[];
}
