/**
 * O que deixa o navegador entrar num ambiente protegido, mandado só à origem do app:
 * headers e um login.
 */
export interface IWebAccess {
  headers: Record<string, string>;
  credentials: { username: string; password: string } | null;
}
