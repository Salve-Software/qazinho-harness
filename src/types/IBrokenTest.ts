/**
 * Um teste quebrado da suíte do time como quem o conserta o lê: onde está, como falhou e
 * as telas.
 */
export interface IBrokenTest {
  title: string;
  file: string;
  line: number;
  project: string;
  path: string[];
  error: string;
  notes: string;
  screenshots: string[];
}
