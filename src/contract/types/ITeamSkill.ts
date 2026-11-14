/**
 * Uma skill do time que o host entrega ao agente: o nome, quando usar, as instruções, a
 * pasta com os arquivos dela, e se o QA a chamou nesta mensagem.
 */
export interface ITeamSkill {
  name: string;
  description: string;
  body: string;
  dir: string;
  isCalled: boolean;
}
