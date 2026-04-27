import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    // React Router v7 framework mode regenerates `.react-router/types/`
    // on every build with codegen patterns (namespace declarations etc.)
    // that don't match repo lint rules. Skip linting generated output.
    ignores: ['.react-router/**', 'build/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/workspace-constant-naming': 'off',
      '@nx/workspace-fields-before-callbacks': 'off',
      '@nx/workspace-lines-between-type-members': 'off',
    },
  },
];
