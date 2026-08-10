import nx from '@nx/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';

// Import custom rules
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const customRules = await import(
  join(__dirname, 'tools/eslint-rules/index.js')
);

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      'unused-imports': unusedImports,
      org: customRules.default,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:shell',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:umdzidzisi',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:umtengesi',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:ui',
                'type:util',
              ],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:util'],
            },
          ],
        },
      ],
      // Unused imports detection (from backend-services)
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      // Console restrictions for production code (from backend-services)
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },
  // TypeScript strict typing rules (from backend-services)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Enforce explicit type annotations on variables, parameters, and properties
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: false, // Allow: const [a, b] = tuple
          arrowParameter: false, // Allow: arr.map(x => x * 2)
          memberVariableDeclaration: true, // Require: property: Type
          objectDestructuring: false, // Allow: const { a, b } = obj
          parameter: true, // Require: function(param: Type)
          propertyDeclaration: true, // Require: class property: Type
          variableDeclaration: true, // Require: const var: Type = value
          variableDeclarationIgnoreFunction: false, // Enforce even for functions
        },
      ],
      // Enforce explicit return types on functions and methods
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true, // Allow: const x = () => 5
          allowTypedFunctionExpressions: true, // Allow: const x: Fn = () => {}
          allowHigherOrderFunctions: true, // Allow: fn(x => x)
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
      // Enforce explicit return types on exported functions
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        {
          allowArgumentsExplicitlyTypedAsAny: false,
          allowDirectConstAssertionInArrowFunctions: true,
          allowHigherOrderFunctions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      // Disable no-inferrable-types to avoid conflicts with typedef rule
      '@typescript-eslint/no-inferrable-types': 'off',
      // Enforce explicit access modifiers (public/private/protected) on class members
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit', // Require explicit modifiers on ALL members
        },
      ],
    },
  },
  // Test files - relax console restrictions
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/e2e/**/*.ts',
      '**/tests/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
];
