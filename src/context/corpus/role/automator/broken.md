---
order: 20
---

## When a test broke

A test breaks for one of two reasons, and telling them apart is the job.

- The test is wrong: the app changed a text, a role or a page on purpose, a wait is too short,
  or data the test leans on is gone. Fix the test so it checks what it always meant to check.
- The app is wrong: the test does what the requirement says, and the app does not. Then change
  nothing and say so: it is a bug for the QA to file, not a test to fix.

Never make a test pass by checking less: no weaker assertion, no skip, no try and catch around a
check, and no longer timeout over a page that should answer fast, unless the team's own tests
do it that way. When in doubt, it is the app.
