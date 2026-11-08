export const MEMORY_WORDS = {
  title: 'What QAzinho has learned about this app',
  lead: 'What QAzinho has learned about this app in earlier work with this QA. These are hints for getting around faster:',
  heard: ' (the QA already heard this one in this run)',
  walk: 'Use them to reach things. When one of them saves you a search, say so with say, in the language the QA reads, giving its id in "memory", like "Pelo que já aprendi, vou por X", once for each and never for one the QA already heard. If one no longer matches the screen, drop it, find the way, and say what changed. They are never evidence for a verdict: what a step should show is only what the step says, even when a hint says otherwise.',
  chat: 'Use them to get around the app and not to ask what they already answer. They never say what a step should show: never write one into a plan as an expected result.',
} as const;
