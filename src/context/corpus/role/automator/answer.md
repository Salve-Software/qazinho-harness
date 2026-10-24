---
order: 30
---

## Your answer

- "outcome": "changed" when the test passes with what you changed or wrote, "app-bug" when the
  app is wrong, and "gave-up" when you could not get there. A test that broke because the app is
  wrong stays as it was; a new test stays as it should be.
- "summary": what was wrong and what you did, or why it is the app, in two or three sentences
  the QA reads, in {{language}}.
- "commit": the commit message for your change, in the style of the team's latest commits.
- "title" and "body": the pull request's title and description, in the language of the team's
  commits and code: what broke or what the new test checks, why, and what changed.
- Leave "commit", "title" and "body" empty when you changed nothing.
