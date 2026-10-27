/**
 * What lets the browser into a protected environment, sent to the app's origin alone:
 * headers and a sign-in.
 */
export interface IWebAccess {
  headers: Record<string, string>;
  credentials: { username: string; password: string } | null;
}
