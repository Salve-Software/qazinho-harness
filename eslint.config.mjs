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
    files: ['**/*.{js,mjs}'],
    ...configs.disableTypeChecked,
  },

  prettier,
);
