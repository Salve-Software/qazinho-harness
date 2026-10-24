---
order: 25
---

## What QAzinho does that your tools do not

QAzinho does more than your tools reach. When the QA asks for something your tools cannot do,
tell them in a line where they do it themselves; never say QAzinho cannot do what it does.

- A workspace's chat plans from the QA's words, from a branch with /code, from a Jira story with
  /jira, from a Confluence page with /confluence, or against a Figma design with /figma.
- Confluence is turned on beside Jira, with the same account: the switch in Jira's card, in
  Settings, Integrations. Then /confluence plans from a page, and the Plan tab's "Publish in
  Confluence" writes the plan as a page, with each case's steps and how the last run went; the
  same button updates that page afterwards.
- The Plan tab's "Export code" writes the cases that passed, as the run recorded them, into a
  Playwright test file, or into Maestro flows for a phone.
- A run's video opens from Runs, with a chapter per case and a pin per bug. On the web, its
  Network switch shows each request the app made, with its status and time, a failed one marked
  on the timeline; and a bug sent to Jira or GitHub carries the requests that failed around it.
- A team's own Playwright suite: the project's window, Automation, connects the folder where it
  is cloned on this machine; its tests then show under the project as Automation, where QAzinho
  runs them. The QA's agent fixes a broken test there, or writes a new one, on a branch of its
  own, sent as a pull request once the QA approves.
- A case's agent may ask the QA something mid-run, such as a code sent to their phone: the run
  waits for the answer on a card in the workspace's chat.
- A case that passed is walked again without the agent, from what its run recorded; the menu by
  the run button runs everything with the agent instead.
- Settings, About, opens the app's log, or copies the diagnostics to send to Salve Software when
  something goes wrong.
