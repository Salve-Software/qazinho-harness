import type { JiraFailure } from '@/contract';

const SOURCES = { jira: 'Jira', confluence: 'Confluence' } as const;

/**
 * Por que o QAzinho não conseguiu buscar uma story ou uma página, em palavras que o
 * agente repassa ao QA, com o que ele pode fazer.
 */
export function sourceFailureOf(props: {
  source: keyof typeof SOURCES;
  failure: JiraFailure | 'off';
  subject: string;
}): string {
  const name = SOURCES[props.source];

  switch (props.failure) {
    case 'off':
      return "Confluence is not on in QAzinho. The QA turns it on in Jira's card, in Settings, Integrations; until then, ask them to paste what the page says.";
    case 'not-connected':
      return 'Jira is not connected to QAzinho. The QA connects it in Settings, Integrations; until then, ask them to paste what you need.';
    case 'unauthorized':
      return `${name} refused the QA's access. The QA connects Jira again in Settings, Integrations.`;
    case 'not-found':
      return `${name} has no ${props.subject}, or the QA's account cannot see it. Ask the QA whether the key or the link is right.`;
    case 'unreachable':
      return `${name} is out of reach from this machine right now. Ask the QA to check the network, or to paste what you need.`;
    case 'rejected':
    case 'unexpected':
      return `${name} did not hand over ${props.subject}. Ask the QA to paste what you need.`;
  }
}
