import { builtinModules } from 'node:module';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const external = [
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
  /^@modelcontextprotocol\/sdk(\/.*)?$/,
  /^yaml(\/.*)?$/,
  /^zod(\/.*)?$/,
  /^playwright-core(\/.*)?$/,
  /^@anthropic-ai\/sdk(\/.*)?$/,
];

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'node22',
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        contract: fileURLToPath(new URL('./src/contract/index.ts', import.meta.url)),
        engine: fileURLToPath(new URL('./src/engine/index.ts', import.meta.url)),
      },
      formats: ['es'],
      fileName: (_format, entry) => `${entry}.js`,
    },
    rollupOptions: { external },
  },
});
