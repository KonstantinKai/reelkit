import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';

export default [
  // `flat/typescript` and `flat/javascript` below only match .ts/.js files, so
  // the recommended sets are applied to .vue script blocks here. The FlatCompat
  // shim this replaces extended `plugin:@nx/typescript` without a `files` key,
  // which is how SFCs picked up these rules before flat config.
  {
    files: ['**/*.vue'],
    rules: js.configs.recommended.rules,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.vue'],
  })),
  {
    files: ['**/*.vue'],
    // Severities mirror nx.configs['flat/typescript'] so SFCs and .ts files
    // are held to the same standard.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
    },
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/.next',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/public/js/p.js',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/e2e-utils/.*$'],
          checkDynamicDependenciesExceptions: ['@reelkit/*'],
          depConstraints: [
            // Core has no framework dependencies
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core'],
            },
            // React packages cannot depend on Angular packages
            {
              sourceTag: 'scope:react',
              notDependOnLibsWithTags: ['scope:angular'],
            },
            // Angular packages cannot depend on React packages
            {
              sourceTag: 'scope:angular',
              notDependOnLibsWithTags: ['scope:react'],
            },
            // Shared data has no external dependencies
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // Untagged projects (apps, tools) can depend on anything
            { sourceTag: '*', onlyDependOnLibsWithTags: ['*'] },
          ],
        },
      ],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Nothing implements an interface with a class, so a callable member is
      // a property holding a function, the same as an options callback. That
      // also keeps `fields-before-callbacks` able to see every callable.
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['apps/**'],
    rules: {
      '@nx/workspace-lines-between-type-members': [
        'error',
        { exceptAfterCommentlessMembers: true },
      ],
      '@nx/workspace-fields-before-callbacks': 'error',
      '@nx/workspace-constant-naming': 'error',
      '@nx/workspace-jsdoc-link-in-file': 'error',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
];
