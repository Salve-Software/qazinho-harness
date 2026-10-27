/** What lets the browser into an app whose environment is protected, sent to the app's own origin alone: headers on each of its requests, such as Vercel's bypass for automation, and the user and password of a browser sign-in. */
export interface IWebAccess {
  headers: Record<string, string>;
  credentials: { username: string; password: string } | null;
}
