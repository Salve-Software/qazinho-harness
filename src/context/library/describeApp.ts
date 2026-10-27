import type { IHarnessSection } from '@/context/types';
import type { IAppRunBrief, IAppSnapshot, IAppWorkspaceBrief } from '@/contract';
import { LANGUAGE_NAMES, SCREEN_NAMES, THEME_NAMES } from '@/constants';

const ENDINGS: Record<IAppRunBrief['endedBy'], string> = {
  finished: 'walked the whole plan',
  stopped: 'stopped by the QA',
  broke: 'broke before the end',
  interrupted: 'cut short when QAzinho closed',
};

const INTEGRATION_NAMES = { github: 'GitHub', jira: 'Jira' } as const;

/**
 * QAzinho as it is now: how the QA set it up, the trackers, every project with its
 * variables by name, and every workspace by id.
 */
export function describeApp(app: IAppSnapshot): IHarnessSection {
  const integrations = app.integrations.map(({ id, account }) =>
    account === null
      ? `${INTEGRATION_NAMES[id]} is not connected.`
      : `${INTEGRATION_NAMES[id]} is connected as ${account}.`,
  );

  return {
    title: 'QAzinho now',
    lines: [
      `The QA reads QAzinho in ${LANGUAGE_NAMES[app.language]}, on the theme it calls ${THEME_NAMES[app.language][app.theme]}. ${
        app.runAlert === 'system'
          ? 'A run that ends while they are away calls them with a notification and its sound.'
          : 'A run that ends calls them only inside QAzinho.'
      }`,
      SCREEN_NAMES[app.language],
      [`Their agent is ${app.agent}.`, ...integrations].join(' '),
      ...(app.projects.length === 0
        ? ['There are no projects yet.']
        : [
            'Projects:',
            ...app.projects.flatMap((project) => {
              const parts = [
                ...project.targets.map(({ kind, value }) => `${kind} ${value}`),
                ...project.repositories.map(
                  ({ name, base }) => `repository ${name}, base ${base}`,
                ),
              ];

              return [
                `- ${project.id} "${project.name}": ${parts.length === 0 ? 'no targets' : parts.join(' · ')}`,
                ...project.variables.map(({ name, description }) =>
                  description.length === 0
                    ? `  - variable \${${name}}`
                    : `  - variable \${${name}}: ${description}`,
                ),
              ];
            }),
          ]),
      ...(app.projects.length === 0
        ? []
        : app.workspaces.length === 0
          ? ['There are no workspaces yet.']
          : ['Workspaces:', ...app.workspaces.map(workspaceLine)]),
    ],
  };
}

function plural(props: { count: number; one: string }): string {
  return `${String(props.count)} ${props.one}${props.count === 1 ? '' : 's'}`;
}

function workspaceLine(workspace: IAppWorkspaceBrief): string {
  const run = workspace.latestRun;
  const parts = [
    workspace.cases === 0
      ? 'no plan yet'
      : `${plural({ count: workspace.cases, one: 'case' })}, ${plural({ count: workspace.steps, one: 'step' })}`,
    run === null
      ? 'no runs'
      : `${plural({ count: workspace.runs, one: 'run' })}, the latest ${run.id} ${run.startedOn === null ? '' : `on ${run.startedOn} `}at ${run.startedAt} ${ENDINGS[run.endedBy]}: ${String(run.passed)} passed, ${String(run.failed)} failed, ${String(run.blocked)} blocked, ${String(run.skipped)} skipped`,
    workspace.bugs === 0 ? 'no bugs' : plural({ count: workspace.bugs, one: 'bug' }),
    ...(workspace.design === null
      ? []
      : [`checked against the Figma design "${workspace.design}"`]),
    ...(workspace.isRunning ? ['running now'] : []),
    ...(workspace.isAnswering ? ['its chat agent is answering'] : []),
    ...(workspace.openQuestions === 0
      ? []
      : [
          `its chat waits on the QA's answers to ${plural({ count: workspace.openQuestions, one: 'question' })}`,
        ]),
  ];

  return `- ${workspace.id} "${workspace.name}" in ${workspace.projectId}, on ${workspace.target ?? 'no target'}: ${parts.join(' · ')}`;
}
