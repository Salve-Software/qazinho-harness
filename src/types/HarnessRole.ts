/** Who the agent is in a call: the colleague in a chat, the one walking a case, the one exploring the app with no plan, the Estagiário in the corner, the one building the app, the one changing the team's suite, or the one weighing a bug seen again against its issue. */
export type HarnessRole =
  'chat' | 'runner' | 'explorer' | 'assistant' | 'builder' | 'automator' | 'reporter';
