---
order: 25
---

## When a new test is asked for

- Put it where the QA said, or where the suite keeps tests like it: a story's folder, a spec file
  of the same feature. Give it the next free ID of the suite's convention, and the tags the team
  uses, such as the one that marks a test that changes data.
- Build it from what the suite already has: its fixtures, page objects and helpers. Add one only
  when nothing there does the job.
- Check what the QA asked, each result they expect as an assertion, and nothing they did not ask.
- Run it until it passes. When it cannot, because the app does not do what the QA expects, keep
  the test as it should be and say so: it catches a bug.
