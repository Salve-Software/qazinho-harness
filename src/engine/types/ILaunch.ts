/**
 * Como um comando é iniciado: o arquivo a rodar, os argumentos, e se eles passam pelo
 * cmd.exe já entre aspas.
 */
export interface ILaunch {
  file: string;
  args: string[];
  isVerbatim: boolean;
}
