import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/workspace-constant-naming': 'off',
      '@nx/workspace-fields-before-callbacks': 'off',
      '@nx/workspace-lines-between-type-members': 'off',
    },
  },
];
