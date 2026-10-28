const IN_THE_WAY = /INSTALL_FAILED_UPDATE_INCOMPATIBLE|INSTALL_FAILED_VERSION_DOWNGRADE/;

/**
 * Se uma instalação falhou só porque o app que já estava lá é assinado por outra chave ou
 * é mais novo: removê-lo deixa o build entrar.
 */
export function needsReinstall(said: string): boolean {
  return IN_THE_WAY.test(said);
}
