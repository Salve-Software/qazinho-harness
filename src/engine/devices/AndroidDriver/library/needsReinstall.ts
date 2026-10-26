const IN_THE_WAY = /INSTALL_FAILED_UPDATE_INCOMPATIBLE|INSTALL_FAILED_VERSION_DOWNGRADE/;

/** Whether an install failed only because the app already there is signed by another key or is newer: removing it lets the build in. */
export function needsReinstall(said: string): boolean {
  return IN_THE_WAY.test(said);
}
