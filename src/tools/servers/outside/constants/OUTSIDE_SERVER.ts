export const OUTSIDE_SERVER = {
  path: 'mcp',
  instructions:
    "QAzinho is the QA's desktop test assistant: it keeps test plans, walks them on a real browser, emulator or simulator, and keeps what each run found. Use it to check the app after you change it: list_workspaces to find the workspace, start_run, then run_status with waitSeconds until it ends. Read a failure's screenshots and API calls before you fix it, then run it again. Suggest cases for what you built with suggest_cases. Secrets stay with the QA: you only ever see a variable by its name, as ${NAME}.",
} as const;
