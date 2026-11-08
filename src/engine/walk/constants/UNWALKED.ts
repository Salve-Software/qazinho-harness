export const UNWALKED = {
  skipped: 'Skipped because the step before it did not hold up.',
  unreported: 'The agent ended its turn without reporting this step.',
  noAgent:
    'Skipped: this run walks recordings alone, and this case has none that still holds.',
  capped: 'Skipped: the run spent all it may on the model.',
  asked: 'Skipped: the agent needed the QA, and no one answers in this run. It asked:',
  noValue: 'Skipped: this case types a variable this run has no value for:',
  noData:
    'Blocked: the environment does not hold the data this recording expects, so check the test data.',
} as const;
