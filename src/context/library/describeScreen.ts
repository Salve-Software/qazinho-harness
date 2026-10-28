import type { IHarnessSection } from '@/context/types';
import type { IAppSnapshot } from '@/contract';

/**
 * Onde o QA está no QAzinho enquanto escreve: início, configurações, ou o chat de um
 * workspace com o painel ao lado numa das abas, e o que está aberto ali.
 */
export function describeScreen(app: IAppSnapshot): IHarnessSection {
  const title = 'On screen';
  const workspace = app.workspaces.find(({ id }) => id === app.openWorkspaceId);

  if (app.screen === 'settings')
    return { title, lines: ["The QA is in QAzinho's settings."] };

  if (app.screen !== 'workspace' || workspace === undefined)
    return { title, lines: ["The QA is on QAzinho's home."] };

  const open =
    app.openTab === 'runs' && app.openRunId !== null
      ? `, with run ${app.openRunId} open`
      : app.openTab === 'bugs' && app.openBugId !== null
        ? `, with bug ${app.openBugId} open`
        : '';

  return {
    title,
    lines: [
      app.openTab === null
        ? `The QA is on the workspace "${workspace.name}" (${workspace.id}), on its chat, with the panel beside it hidden.`
        : `The QA is on the workspace "${workspace.name}" (${workspace.id}), on its chat, with its ${app.openTab} tab open in the panel beside it${open}.`,
    ],
  };
}
