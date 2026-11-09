declare module '*?raw' {
  const text: string;
  export default text;
}

interface ImportMeta {
  glob: (
    pattern: string,
    options: { query: '?raw'; import: 'default'; eager: true },
  ) => Record<string, string>;
}
