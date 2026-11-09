import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { flatConfigs as importX } from 'eslint-plugin-import-x';
import { config, configs } from 'typescript-eslint';

const NO_UPWARD_RELATIVE = {
  regex: '^\\.\\./',
  message:
    'Use the @/ alias instead of an upward relative path. Only ./ within the same directory is allowed.',
};

const NO_HOST_IN_THE_HARNESS = {
  group: [
    'electron',
    'electron/*',
    'fastify',
    'fastify/*',
    'drizzle-orm',
    'drizzle-orm/*',
  ],
  message:
    'The harness runs inside the desktop and the API alike. Declare what it needs as a port in its types, and let the host fill it.',
};

const LIBRARY_ORDER =
  'A library file opens with its export: its helper functions go after it, at the end of the file.';

const QAZINHO = {
  rules: {
    'no-comment-in-type': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          inside:
            'No comment inside an interface or a type: say it in the JSDoc above the type, in two lines at most.',
        },
      },
      create(context) {
        const reported = new Set();
        const check = (node) => {
          for (const comment of context.sourceCode.getCommentsInside(node)) {
            if (reported.has(comment.range[0])) continue;
            reported.add(comment.range[0]);
            context.report({ loc: comment.loc, messageId: 'inside' });
          }
        };

        return { TSInterfaceBody: check, TSTypeLiteral: check };
      },
    },
    'short-jsdoc': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          long: 'A JSDoc says what the thing does in two lines at most, each within 90 columns.',
        },
      },
      create(context) {
        return {
          Program() {
            const { lines } = context.sourceCode;
            for (const comment of context.sourceCode.getAllComments()) {
              if (comment.type !== 'Block' || !comment.value.startsWith('*')) continue;
              const said = comment.value
                .split('\n')
                .map((line) => line.replace(/^\s*\*?\s?/, '').trim())
                .filter(Boolean);
              const isWide = lines
                .slice(comment.loc.start.line - 1, comment.loc.end.line)
                .some((line) => line.length > 90);
              if (said.length > 2 || isWide)
                context.report({ loc: comment.loc, messageId: 'long' });
            }
          },
        };
      },
    },
  },
};

export default config(
  { ignores: ['dist', 'node_modules', 'coverage'] },

  js.configs.recommended,
  ...configs.recommendedTypeChecked,
  importX.recommended,
  importX.typescript,

  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        }),
      ],
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: false },
      ],

      'import-x/order': [
        'error',
        {
          groups: [
            ['type'],
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': ['error', { 'prefer-inline': false }],
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [NO_UPWARD_RELATIVE, NO_HOST_IN_THE_HARNESS] },
      ],

      '@typescript-eslint/require-await': 'off',

      'max-params': ['error', 2],

      'import-x/no-unresolved': [
        'error',
        { ignore: ['^@modelcontextprotocol/sdk/.+\\.js$'] },
      ],

      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              'signature',
              'field',
              'constructor',
              'public-method',
              'protected-method',
              'private-method',
              '#private-method',
            ],
          },
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['**/*.class.ts'],
    ignores: ['src/**/__tests__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > FunctionDeclaration',
          message:
            'This file holds one thing. Move the function to library/, where it gets its own file and its own test.',
        },
        {
          selector:
            'Program > ExportNamedDeclaration > FunctionDeclaration, Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[init.type=/FunctionExpression|ArrowFunctionExpression/]:not([id.name=/^use[A-Z]/]):not([id.name=/^[A-Z]/])',
          message:
            'This file holds one thing. Move the function to library/, where it gets its own file and its own test.',
        },
        {
          selector: 'Program > VariableDeclaration',
          message:
            'This file holds one thing. Move the value to constants/, one per file, named.',
        },
        {
          selector:
            'Program > TSTypeAliasDeclaration, Program > TSInterfaceDeclaration, Program > ExportNamedDeclaration > TSTypeAliasDeclaration, Program > ExportNamedDeclaration > TSInterfaceDeclaration',
          message:
            'This file holds one thing. Move the type to types/, one type per file.',
        },
      ],
    },
  },

  {
    files: ['src/**/__tests__/**/*.ts', '*.config.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'no-console': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx,mts}'],
    ignores: ['**/__tests__/**', 'tests/**', 'test/**'],
    plugins: { qazinho: QAZINHO },
    rules: {
      'qazinho/no-comment-in-type': 'error',
      'qazinho/short-jsdoc': 'error',
    },
  },

  {
    files: ['**/library/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/library/index.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > FunctionDeclaration ~ ExportNamedDeclaration',
          message: LIBRARY_ORDER,
        },
        {
          selector:
            'Program > VariableDeclaration[declarations.0.init.type=/^(ArrowFunctionExpression|FunctionExpression)$/] ~ ExportNamedDeclaration',
          message: LIBRARY_ORDER,
        },
      ],
    },
  },

  {
    files: ['**/*.{js,mjs}'],
    ...configs.disableTypeChecked,
  },

  {
    files: ['src/engine/devices/WebDriver/constants/PDF_ENGINE.ts'],
    rules: { 'import-x/default': 'off' },
  },

  prettier,
);
