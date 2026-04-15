import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.config({ extends: ['plugin:@nx/typescript'] }),
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
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
];
