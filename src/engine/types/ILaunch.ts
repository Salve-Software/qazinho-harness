/** How a command is started: the file to run, its arguments, and whether they go through cmd.exe already quoted. */
export interface ILaunch {
  file: string;
  args: string[];
  isVerbatim: boolean;
}
