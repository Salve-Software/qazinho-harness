export const OUTSIDE_SERVER = {
  path: 'mcp',
  instructions:
    "QAzinho is the QA's desktop test assistant: it keeps test plans, walks them on a real browser, emulator or simulator, and keeps what each run found. Use it to check the app after you change it: list_workspaces to find the workspace, or create_project and create_workspace when the app has none, start_run, then run_status with waitSeconds until it ends. Read a failure's screenshots and API calls before you fix it, then run it again. Write cases for what you built with add_cases, or ask the workspace's own agent to plan with ask_workspace_chat: what only an AI does in QAzinho, such as planning from a Jira story, a Figma design or the code, goes through that chat. Before anything that changes or deletes what the user keeps, ask them with your own tool for asking, and go ahead only on their yes. Secrets stay with the QA: you only ever see a variable by its name, as ${NAME}.",
} as const;
